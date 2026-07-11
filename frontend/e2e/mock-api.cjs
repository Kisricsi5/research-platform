// Deterministic mock of the Labyro backend for e2e verification.
// Role-aware: the bearer token selects which user /auth/me returns, so one
// server exercises both the professor and student sides of the app.
const http = require('http');

const PORT = Number(process.env.MOCK_PORT || 5998);

const now = () => new Date().toISOString();

const student = {
  id: 'stu-1', userId: 'user-stu-1',
  firstName: 'Milan', lastName: 'Markovits',
  university: 'Princeton University', major: 'Economics',
  graduationYear: 2027, gpa: 3.7,
  bio: 'Interested in behavioral economics.',
  cvFilePath: null, profilePicture: null,
  skills: ['Stata', 'R'], researchInterests: ['Behavioral Economics'],
  isVisible: true, createdAt: now(), updatedAt: now(),
};

const professorProfile = {
  id: 'prof-1', userId: 'user-prof-1',
  firstName: 'Ada', lastName: 'Prof', title: 'Professor',
  department: 'Economics', university: 'Princeton University',
  researchAreas: ['Behavioral Economics'], labName: null, labWebsite: null,
  bio: 'Behavioral econ lab.', profilePicture: null, acceptingStudents: true,
  createdAt: now(), updatedAt: now(),
};

const project = {
  id: 'proj-1', professorId: 'prof-1',
  title: 'Behavioral Economics RA',
  description: 'Help run experiments on decision making.',
  requiredSkills: ['Stata'], preferredMajors: ['Economics'],
  preferredYears: ['junior', 'senior'],
  hoursPerWeek: 8, duration: '1 semester',
  compensationType: 'UNPAID', applicationDeadline: null,
  openToOtherUniversities: true, isActive: true, isFilled: false,
  createdAt: now(), updatedAt: now(),
};

const publicProfessor = { ...professorProfile, user: { emailVerified: true }, _count: { projects: 1 } };
const projectProfessor = {
  id: 'prof-1', firstName: 'Ada', lastName: 'Prof', title: 'Professor',
  department: 'Economics', university: 'Princeton University',
  profilePicture: null, user: { emailVerified: true },
};
const publicProject = { ...project, professor: projectProfessor, _count: { applications: 1 } };

const application = {
  id: 'app-1', studentId: 'stu-1', professorId: 'prof-1', projectId: 'proj-1',
  coverLetter: 'I would love to join your lab.\nI have taken econometrics.',
  availability: '10 hrs/week', status: 'PENDING', professorNotes: null,
  createdAt: now(), updatedAt: now(),
  student: { ...student, cvFilePath: 'https://research-platform-files.s3.us-east-2.amazonaws.com/cvs/test.pdf' },
  project,
};

const users = {
  'prof-token': {
    id: 'user-prof-1', email: 'prof@princeton.edu', role: 'PROFESSOR',
    emailVerified: true, hasProfile: true, profileId: 'prof-1', profile: professorProfile,
  },
  'student-token': {
    id: 'user-stu-1', email: 'milan@princeton.edu', role: 'STUDENT',
    emailVerified: true, hasProfile: true, profileId: 'stu-1', profile: student,
  },
};

const paginated = (data) => ({
  data,
  meta: { total: data.length, page: 1, limit: 12, totalPages: 1, hasNextPage: false, hasPrevPage: false },
});

const routes = {
  'GET /api/config': { aiFitAnalysis: true },
  'GET /api/notifications': [],

  // Public browse/detail
  'GET /api/projects': paginated([publicProject]),
  'GET /api/projects/proj-1': { ...publicProject, professor: { ...projectProfessor, bio: professorProfile.bio, researchAreas: professorProfile.researchAreas, labName: null, acceptingStudents: true } },
  'GET /api/professors': paginated([publicProfessor]),
  'GET /api/professors/prof-1': { ...publicProfessor, projects: [project], isSaved: false, _count: { applications: 1 } },

  // Professor side
  'GET /api/professor/dashboard': { activeProjects: 1, totalApplications: 1, recentApplications: 1, pendingApplications: 1 },
  'GET /api/professor/profile': { ...professorProfile, projects: [project] },
  'GET /api/professor/projects': [{ ...project, _count: { applications: 1 } }],
  'GET /api/professor/applications': paginated([application]),
  'GET /api/professor/applications/app-1': application,
  'GET /api/professor/applications/app-1/cv': { url: 'http://localhost:5998/api/config' },

  // Student side
  'GET /api/student/profile': student,
  'GET /api/student/applications': [{ ...application, professor: projectProfessor }],
  'GET /api/student/applications/app-1': { ...application, professor: { ...professorProfile }, project },
  'GET /api/student/saved-professors': [],

  // Messages (thread starts empty; POST appends)
  'GET /api/applications/app-1/messages': null, // handled statefully below
};

const messages = [];

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('content-type', 'application/json');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const key = `${req.method} ${req.url.split('?')[0]}`;
  const token = (req.headers.authorization || '').replace('Bearer ', '');

  if (key === 'GET /api/auth/me') {
    const me = users[token];
    if (!me) { res.writeHead(401); return res.end(JSON.stringify({ error: 'No token' })); }
    res.writeHead(200); return res.end(JSON.stringify(me));
  }

  if (key === 'GET /api/applications/app-1/messages') {
    res.writeHead(200); return res.end(JSON.stringify(messages));
  }
  if (key === 'POST /api/applications/app-1/messages') {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      const { body } = JSON.parse(raw || '{}');
      const senderId = users[token]?.id ?? 'user-prof-1';
      const msg = { id: `m${messages.length + 1}`, applicationId: 'app-1', senderId, body, createdAt: now() };
      messages.push(msg);
      res.writeHead(201); res.end(JSON.stringify(msg));
    });
    return;
  }
  if (key.startsWith('PATCH /api/notifications')) {
    res.writeHead(200); return res.end(JSON.stringify({ ok: true }));
  }

  const body = routes[key];
  if (body !== undefined && body !== null) {
    res.writeHead(200); return res.end(JSON.stringify(body));
  }
  res.writeHead(404);
  res.end(JSON.stringify({ error: `mock: no route ${key}` }));
}).listen(PORT, () => console.log(`mock api on ${PORT}`));

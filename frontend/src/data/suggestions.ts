// Curated suggestion lists for tag pickers.
// Users can always type a custom entry — these just speed up the common cases.

export const COMMON_SKILLS: string[] = [
  // Programming & data
  'Python', 'R', 'MATLAB', 'Java', 'C++', 'JavaScript', 'SQL', 'Julia', 'Stata', 'SPSS',
  'Data Analysis', 'Statistics', 'Machine Learning', 'Deep Learning', 'Computer Vision',
  'Natural Language Processing', 'Data Visualization', 'Bioinformatics', 'Computational Modeling',
  'Simulation', 'Git', 'Linux', 'High-Performance Computing', 'Web Development', 'App Development',
  'Excel', 'Tableau', 'GIS',

  // Lab & experimental
  'Wet Lab Techniques', 'PCR', 'qPCR', 'Gel Electrophoresis', 'Western Blot', 'ELISA',
  'Cell Culture', 'Tissue Culture', 'Microscopy', 'Confocal Microscopy', 'Electron Microscopy',
  'Flow Cytometry', 'CRISPR', 'Cloning', 'DNA Extraction', 'RNA Extraction', 'Sequencing Analysis',
  'Histology', 'Immunohistochemistry', 'Protein Purification', 'Chromatography', 'Mass Spectrometry',
  'Spectroscopy', 'NMR', 'Titration', 'Organic Synthesis', 'Animal Handling', 'Mouse Models',
  'Zebrafish', 'Drosophila', 'Aseptic Technique', 'Lab Safety',

  // Engineering & physical sciences
  'CAD', 'SolidWorks', 'Arduino', 'Raspberry Pi', 'Circuit Design', '3D Printing', 'Soldering',
  'Prototyping', 'Finite Element Analysis', 'Signal Processing', 'Control Systems', 'Robotics',
  'Microfabrication', 'Materials Characterization', 'Optics',

  // Research methods & social science
  'Literature Review', 'Study Design', 'Survey Design', 'Interviewing', 'Qualitative Analysis',
  'Quantitative Analysis', 'Field Work', 'Ethnography', 'Behavioral Experiments',
  'EEG', 'fMRI', 'Eye Tracking', 'Psychophysics', 'Clinical Research', 'IRB Protocols',
  'Human Subjects Research', 'Epidemiology', 'Archival Research',

  // Communication & general
  'Scientific Writing', 'Technical Writing', 'Grant Writing', 'Academic Presentations',
  'Poster Design', 'LaTeX', 'Data Entry', 'Project Management', 'Mentoring', 'Teamwork',
  'Critical Thinking', 'Attention to Detail', 'Time Management', 'Spanish', 'Mandarin', 'French',
];

export const COMMON_MAJORS: string[] = [
  'Computer Science', 'Biology', 'Molecular Biology', 'Biochemistry', 'Chemistry', 'Physics',
  'Mathematics', 'Applied Mathematics', 'Statistics', 'Data Science', 'Neuroscience',
  'Psychology', 'Cognitive Science', 'Electrical Engineering', 'Mechanical Engineering',
  'Chemical Engineering', 'Biomedical Engineering', 'Civil Engineering', 'Materials Science',
  'Aerospace Engineering', 'Environmental Science', 'Ecology', 'Earth Science', 'Geology',
  'Astronomy', 'Astrophysics', 'Economics', 'Political Science', 'Sociology', 'Anthropology',
  'Linguistics', 'Philosophy', 'History', 'English', 'Comparative Literature', 'Public Health',
  'Public Policy', 'Pre-Med', 'Nursing', 'Kinesiology', 'Nutrition', 'Genetics', 'Microbiology',
  'Immunology', 'Pharmacology', 'Marine Biology', 'Plant Biology', 'Bioinformatics',
  'Operations Research', 'Finance', 'Business', 'Education', 'Architecture', 'Urban Planning',
  'Art History', 'Music', 'Communications',
];

export const COMMON_RESEARCH_INTERESTS: string[] = [
  'Machine Learning', 'Artificial Intelligence', 'Computer Vision', 'Natural Language Processing',
  'Robotics', 'Human-Computer Interaction', 'Cybersecurity', 'Quantum Computing',
  'Neuroscience', 'Cognitive Science', 'Genetics', 'Genomics', 'CRISPR / Gene Editing',
  'Cancer Biology', 'Immunology', 'Microbiology', 'Cell Biology', 'Developmental Biology',
  'Synthetic Biology', 'Bioinformatics', 'Drug Discovery', 'Public Health', 'Epidemiology',
  'Global Health', 'Mental Health', 'Climate Science', 'Environmental Science', 'Ecology',
  'Conservation', 'Renewable Energy', 'Materials Science', 'Nanotechnology', 'Astrophysics',
  'Particle Physics', 'Condensed Matter Physics', 'Organic Chemistry', 'Physical Chemistry',
  'Behavioral Economics', 'Development Economics', 'Political Behavior', 'Social Psychology',
  'Education Research', 'Science Policy', 'Bioethics', 'History of Science', 'Archaeology',
  'Linguistics', 'Data Science', 'Statistics', 'Applied Mathematics',
];

export const YEAR_OPTIONS = [
  { value: 'freshman', label: 'Freshman' },
  { value: 'sophomore', label: 'Sophomore' },
  { value: 'junior', label: 'Junior' },
  { value: 'senior', label: 'Senior' },
  { value: 'graduate', label: 'Graduate' },
] as const;

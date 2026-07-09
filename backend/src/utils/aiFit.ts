/**
 * AI applicant-fit analysis.
 *
 * Decision-support only: produces a structured summary of how well an applicant
 * fits a specific research position. The professor always makes the final call.
 * Feature is inert unless ANTHROPIC_API_KEY is configured.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5';

export interface FitInput {
  project: {
    title: string;
    description: string;
    requiredSkills: string[];
    preferredMajors: string[];
    preferredYears?: string[];
  };
  student: {
    major: string;
    university: string;
    graduationYear: number;
    gpa?: number | null;
    skills: string[];
    researchInterests: string[];
    bio?: string | null;
  };
  coverLetter: string;
  availability?: string | null;
}

export interface FitResult {
  fitLevel: 'Strong' | 'Moderate' | 'Limited';
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestedQuestions: string[];
}

export function isAiConfigured(): boolean {
  return typeof process.env.ANTHROPIC_API_KEY === 'string' && process.env.ANTHROPIC_API_KEY.length > 0;
}

const SYSTEM_PROMPT = `You are an assistant that helps university professors and lab PIs review applications from students for research positions. You produce concise, evidence-based fit assessments.

Rules you must follow:
- Assess ONLY fit between the applicant and THIS specific research position, based on the information provided.
- Base every point on concrete evidence from the application (skills, coursework, stated interests, cover letter). Never invent facts.
- Do NOT consider or comment on protected characteristics (race, gender, age, nationality, disability, etc.). Judge only relevant qualifications, skills, and demonstrated interest.
- You are a decision-support tool. The professor makes the final decision. Frame output as guidance, never as a verdict.
- Be honest about weaknesses, but constructive and professional in tone.
- Keep it brief and scannable.`;

function buildUserPrompt(input: FitInput): string {
  const { project, student, coverLetter, availability } = input;
  return `Assess this applicant's fit for the research position below.

## RESEARCH POSITION
Title: ${project.title}
Description: ${project.description}
Required skills: ${project.requiredSkills.join(', ') || 'None specified'}
Preferred majors: ${project.preferredMajors.join(', ') || 'None specified'}
Preferred years: ${project.preferredYears?.join(', ') || 'Any'}

## APPLICANT
Major: ${student.major}
University: ${student.university}
Graduation year: ${student.graduationYear}
GPA: ${student.gpa ?? 'Not provided'}
Skills: ${student.skills.join(', ') || 'None listed'}
Research interests: ${student.researchInterests.join(', ') || 'None listed'}
Bio: ${student.bio || 'Not provided'}
Availability: ${availability || 'Not specified'}

Cover letter:
${coverLetter}

## OUTPUT
Respond with ONLY a JSON object (no markdown, no prose outside the JSON) in exactly this shape:
{
  "fitLevel": "Strong" | "Moderate" | "Limited",
  "summary": "2-3 sentence overall assessment of fit for THIS position",
  "strengths": ["specific, evidence-based strength", "..."],
  "gaps": ["specific gap or area to probe", "..."],
  "suggestedQuestions": ["a question the professor could ask in an interview", "..."]
}
Provide 2-4 items in each array.`;
}

export async function analyzeFit(input: FitInput): Promise<FitResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('AI is not configured');

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(input) }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`AI request failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = data.content?.find((c) => c.type === 'text')?.text ?? '';

  // Extract the JSON object defensively (model is instructed to return pure JSON)
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('AI returned an unexpected response');

  const parsed = JSON.parse(text.slice(start, end + 1)) as FitResult;

  // Normalize / guard
  const validLevels = ['Strong', 'Moderate', 'Limited'];
  return {
    fitLevel: validLevels.includes(parsed.fitLevel) ? parsed.fitLevel : 'Moderate',
    summary: String(parsed.summary ?? '').slice(0, 800),
    strengths: (parsed.strengths ?? []).slice(0, 4).map((s) => String(s)),
    gaps: (parsed.gaps ?? []).slice(0, 4).map((s) => String(s)),
    suggestedQuestions: (parsed.suggestedQuestions ?? []).slice(0, 4).map((s) => String(s)),
  };
}

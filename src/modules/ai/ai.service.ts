import { prisma } from "../../lib/prisma";
import { callOpenRouter } from "../../utils/ai";
import { envVars } from "../../config/env";

const SYSTEM_PROMPT = `You are SkillBridge AI, the helpful assistant for SkillBridge, a premium educational platform.
Your goal is to help users find courses, discover tutors, and manage their learning experience.
You have access to the platform's database through tools. Always use these tools to provide accurate, up-to-date information.

Frontend URL Context:
The frontend application is running at: ${envVars.APP_URL}
Course Detail Path: ${envVars.APP_URL}/courses/[courseId]
Tutor Detail Path: ${envVars.APP_URL}/tutors/[tutorId]

Formatting Guidelines:
1. **Always use Markdown**: Use bold for titles, bullet points for lists, and headings for sections.
2. **Space out your content**: Use double line breaks between paragraphs and sections to avoid "walls of text".
3. **Structured Lists & Links**: When listing courses or tutors, always link the title/name to its detail page. Format like:
   ### [[Course Name]](${envVars.APP_URL}/courses/[id])
   - **Tutor/Institute**: [Name]
   - **Brief Description**: [One sentence]
   - **Price**: [Price]
4. Be friendly, professional, and concise. Don't make up courses or tutors.
5. If a user asks for "suggestions" without specifics, show a mix of top courses and featured tutors.
`;

const tools = [
  {
    type: "function",
    function: {
      name: "searchCourses",
      description:
        "Search for published courses in the database based on keywords.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search keyword for title or description",
          },
          limit: { type: "number", default: 5 },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getCourseDetails",
      description: "Get full details for a specific course by its ID.",
      parameters: {
        type: "object",
        properties: {
          courseId: { type: "string", description: "The ID of the course" },
        },
        required: ["courseId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchTutors",
      description: "Search for tutors in the database based on keywords.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search keyword for tutor name or bio",
          },
          limit: { type: "number", default: 5 },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getFeaturedTutors",
      description: "Get a list of featured tutors.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", default: 5 },
        },
      },
    },
  },
];

const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  searchCourses: async ({ query, limit = 5 }) => {
    const whereClause: any = { isPublished: true };
    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    return await prisma.course.findMany({
      where: whereClause,
      take: limit,
      include: { category: true, institute: { select: { name: true } } },
    });
  },
  getCourseDetails: async ({ courseId }) => {
    return await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        institute: { select: { name: true, logoUrl: true } },
        mentors: { include: { user: { select: { name: true } } } },
      },
    });
  },
  searchTutors: async ({ query, limit = 5 }) => {
    return await prisma.tutorProfiles.findMany({
      where: query
        ? {
            OR: [
              { bio: { contains: query, mode: "insensitive" } },
              { user: { name: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {},
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
        category: true,
      },
    });
  },
  getFeaturedTutors: async ({ limit = 5 }) => {
    return await prisma.tutorProfiles.findMany({
      where: {
        isFeatured: true,
      },
      take: limit,
      include: { user: { select: { name: true } }, category: true },
    });
  },
};

const chatWithDB = async (messages: any[], user?: any) => {
  const userContext = user
    ? `\nCurrent User Context: Name: ${user.name}, Email: ${user.email}.`
    : "";

  const message = await callOpenRouter({
    model: "openai/gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT + userContext },
      ...messages,
    ],
    tools,
  });

  if (message.tool_calls) {
    const toolMessages = [...messages, message];

    for (const toolCall of message.tool_calls) {
      const handler = toolHandlers[toolCall.function.name];
      if (handler) {
        const result = await handler(JSON.parse(toolCall.function.arguments));
        toolMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: JSON.stringify(result),
        });
      }
    }

    const secondMessage = await callOpenRouter({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + userContext },
        ...toolMessages,
      ],
    });

    return secondMessage.content;
  }

  return message.content;
};

const generateDescription = async (details: {
  title: string;
  category?: string;
  tags?: string[];
}) => {
  const prompt = `Generate a compelling and professional description for a course or subject titled "${details.title}"${details.category ? ` in the category of ${details.category}` : ""}.${details.tags?.length ? ` Key themes: ${details.tags.join(", ")}.` : ""}
Keep it engaging, highlight why students should enroll, and keep it under 200 words.`;

  const message = await callOpenRouter({
    model: "google/gemini-2.0-flash-001",
    messages: [{ role: "user", content: prompt }],
  });

  return message.content;
};

const getSmartRecommendations = async (userId: string) => {
  if (!userId) return [];

  try {
    const upcomingCourses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
      take: 10,
      include: { category: true, institute: { select: { name: true } } },
    });

    if (upcomingCourses.length === 0) return [];

    const eventList = upcomingCourses.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category?.name || "General",
      description: e.description?.substring(0, 100),
    }));

    const prompt = `Suggest the top 4 courses from this list: ${JSON.stringify(eventList)}.
Return ONLY a JSON object with a 'recommendations' key containing an array of objects with 'id' and 'reason' (max 10 words).`;

    const response = await callOpenRouter({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const recommendationData = JSON.parse(response.content);
    const rawRecs =
      recommendationData.recommendations ||
      (Array.isArray(recommendationData) ? recommendationData : []);

    let aiResults = rawRecs
      .map((rec: any) => {
        const course = upcomingCourses.find((c) => c.id === rec.id);
        if (course) {
          return { ...course, aiReason: rec.reason };
        }
        return null;
      })
      .filter(Boolean);

    let finalResults = [...aiResults];
    if (finalResults.length < 4) {
      const filler = upcomingCourses
        .filter((e) => !finalResults.some((r) => r.id === e.id))
        .slice(0, 4 - finalResults.length)
        .map((e) => ({
          ...e,
          aiReason: "Featured as a trending learning path in SkillBridge.",
        }));

      finalResults = [...finalResults, ...filler];
    }

    return finalResults.slice(0, 4);
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
};

export const AIService = {
  chatWithDB,
  generateDescription,
  getSmartRecommendations,
};

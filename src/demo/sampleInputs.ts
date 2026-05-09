import type { ProductInput } from "../types";

export const SAMPLE_INPUTS: ProductInput[] = [
  {
    productName: "AutoReply AI",
    productDescription:
      "We built an AI email assistant that connects to Gmail, reads important emails, and automatically replies on behalf of the user. It decides which emails are urgent, drafts replies, and can send them automatically.",
    targetUsers: "Solo founders and busy executives drowning in inbox triage",
    aiActions:
      "Reads incoming Gmail messages, classifies importance, drafts replies, and sends automatically for trusted senders",
    dataAccessed:
      "Full Gmail mailbox (subjects, bodies, attachments) and the user's sent-mail history for tone learning",
    autonomyLevel: "acts_automatically",
    additionalContext:
      "Installed as a Gmail add-on with full mailbox read/write scope. Free trial for 14 days, then $19/month.",
  },
  {
    productName: "Meeting Agent",
    productDescription:
      "AI meeting assistant that records calls, summarizes decisions, assigns action items, and sends follow-up emails to attendees automatically.",
    targetUsers: "Distributed product and sales teams",
    aiActions:
      "Joins Zoom/Meet/Teams calls, transcribes, extracts decisions and action items, then sends follow-up emails to all attendees",
    dataAccessed:
      "Audio, video, screen share, calendar metadata, and attendee email addresses (including external participants)",
    autonomyLevel: "acts_automatically",
    additionalContext:
      "Bot auto-joins any meeting on the connected calendar. Transcripts stored indefinitely in a searchable workspace.",
  },
  {
    productName: "AI Recruiter",
    productDescription:
      "AI hiring assistant that screens resumes, ranks applicants against the job description, drafts rejection emails for the bottom of the ranking, and recommends a shortlist for interviews.",
    targetUsers: "In-house recruiters at fast-growing startups",
    aiActions:
      "Ingests resumes (PDF, DOCX), scores applicants, drafts personalized rejection emails, and surfaces a shortlist",
    dataAccessed:
      "Applicant names, photos, addresses, education history, work history, and the JD",
    autonomyLevel: "requires_approval",
    additionalContext:
      "Used across US and EU openings. All decisions logged to an audit trail.",
  },
];

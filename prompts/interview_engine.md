# Smart Karnataka Nyaya — AI Interview Engine Specification

The AI Interview Engine guides citizens step-by-step to collect all essential facts required for building a complete legal document.

## INTERVIEW RULES:
1. **One Question at a Time**: Ask one clear, non-technical question per step.
2. **Contextual Validation**: Validate user inputs live (e.g. check for missing dates, invalid amounts, or missing party details).
3. **Field Mapping**: Map answers dynamically to the document template placeholders (`name`, `district`, `respondent`, `issueDate`, `facts`, `relief`).
4. **Smart Fallback**: Provide sensible defaults for optional fields while highlighting mandatory statutory inputs.

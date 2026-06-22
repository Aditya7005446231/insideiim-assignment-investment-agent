import { Annotation } from '@langchain/langgraph';

// This is the definition of the LangGraph State Annotation.
// You can customize this state configuration to include whatever fields
// your agents need to pass between nodes.
export const AgentStateAnnotation = Annotation.Root({
  companyName: Annotation(),
  depth: Annotation(),
  
  // Accumulated data from steps
  researchData: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  financialAnalysis: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  criticReview: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  
  // Final Verdict Details
  decision: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  confidenceScore: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  executiveSummary: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  swot: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => ({ strengths: [], weaknesses: [], opportunities: [], threats: [] }),
  }),
  metrics: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
  
  // Real-time process logs
  logs: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});
export default AgentStateAnnotation;

import { EventEmitter } from 'events';

class AgentEventEmitter extends EventEmitter {}

export const agentEvents = new AgentEventEmitter();
agentEvents.setMaxListeners(200);

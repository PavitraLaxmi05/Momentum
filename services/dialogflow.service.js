const dialogflow = require('@google-cloud/dialogflow');
const path = require('path');

/**
 * Initialize a session client for Dialogflow
 * @returns {Object} - Dialogflow session client
 */
const getSessionClient = () => {
  return new dialogflow.SessionsClient({
    keyFilename: path.join(__dirname, '../config/dialogflow-credentials.json')
  });
};

/**
 * Process a user message with Dialogflow
 * @param {string} message - User message to process
 * @param {string} sessionId - Unique session ID (usually user ID)
 * @returns {Promise<Object>} - Dialogflow response
 */
exports.processMessage = async (message, sessionId) => {
  try {
    const sessionClient = getSessionClient();
    const projectId = process.env.DIALOGFLOW_PROJECT_ID;
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    
    // The text query request
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: 'en-US',
        },
      },
    };
    
    // Send request and get response
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    
    return {
      text: result.fulfillmentText,
      intent: result.intent.displayName,
      confidence: result.intentDetectionConfidence,
      parameters: result.parameters.fields,
      allRequiredParamsPresent: result.allRequiredParamsPresent,
      outputContexts: result.outputContexts
    };
  } catch (error) {
    console.error('Error processing message with Dialogflow:', error);
    throw new Error('Failed to process message with Dialogflow');
  }
};

/**
 * Create a context for a Dialogflow session
 * @param {string} sessionId - Unique session ID (usually user ID)
 * @param {string} contextName - Name of the context to create
 * @param {number} lifespanCount - Number of turns the context will be active
 * @param {Object} parameters - Context parameters
 * @returns {Promise<void>}
 */
exports.createContext = async (sessionId, contextName, lifespanCount, parameters = {}) => {
  try {
    const sessionClient = getSessionClient();
    const projectId = process.env.DIALOGFLOW_PROJECT_ID;
    const contextClient = new dialogflow.ContextsClient({
      keyFilename: path.join(__dirname, '../config/dialogflow-credentials.json')
    });
    
    const contextPath = contextClient.projectAgentSessionContextPath(
      projectId,
      sessionId,
      contextName
    );
    
    const context = {
      name: contextPath,
      lifespanCount: lifespanCount,
      parameters: parameters
    };
    
    await contextClient.createContext({
      parent: `projects/${projectId}/agent/sessions/${sessionId}`,
      context: context
    });
  } catch (error) {
    console.error('Error creating Dialogflow context:', error);
    throw new Error('Failed to create Dialogflow context');
  }
};

/**
 * Get all contexts for a Dialogflow session
 * @param {string} sessionId - Unique session ID (usually user ID)
 * @returns {Promise<Array>} - Array of active contexts
 */
exports.getContexts = async (sessionId) => {
  try {
    const contextClient = new dialogflow.ContextsClient({
      keyFilename: path.join(__dirname, '../config/dialogflow-credentials.json')
    });
    
    const projectId = process.env.DIALOGFLOW_PROJECT_ID;
    const parent = `projects/${projectId}/agent/sessions/${sessionId}`;
    
    const [contexts] = await contextClient.listContexts({ parent });
    
    return contexts;
  } catch (error) {
    console.error('Error getting Dialogflow contexts:', error);
    throw new Error('Failed to get Dialogflow contexts');
  }
};

/**
 * Delete a context for a Dialogflow session
 * @param {string} sessionId - Unique session ID (usually user ID)
 * @param {string} contextName - Name of the context to delete
 * @returns {Promise<void>}
 */
exports.deleteContext = async (sessionId, contextName) => {
  try {
    const contextClient = new dialogflow.ContextsClient({
      keyFilename: path.join(__dirname, '../config/dialogflow-credentials.json')
    });
    
    const projectId = process.env.DIALOGFLOW_PROJECT_ID;
    const contextPath = contextClient.projectAgentSessionContextPath(
      projectId,
      sessionId,
      contextName
    );
    
    await contextClient.deleteContext({ name: contextPath });
  } catch (error) {
    console.error('Error deleting Dialogflow context:', error);
    throw new Error('Failed to delete Dialogflow context');
  }
};
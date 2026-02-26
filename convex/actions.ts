import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { z } from "zod/v3";
import { generateGreeting } from "./agents/generateGreeting";
import { generateCallResponse } from "./agents/generateCallResponse";
import { internal } from "./_generated/api";
import { __vfTrack, __vfTrackSync } from "./_vibeflowTracking";

export const processRequest_generateGreeting = internalAction({
  args: { input: v.any(), systemPrompt: v.optional(v.any()) },
  handler: async (ctx, args) => {
    // Convert input to string if needed
    const inputString = typeof args?.input === 'string' ? args.input : args?.input?.text || JSON.stringify(args?.input);
    
    let content = [{ type: "text", text: inputString }]
    
    if (typeof args?.input !== 'string' && args?.input?.image) {
      content.push({ type: "image", image: args.input.image });
    }
    
    // Call AI agent
    const { thread } = await generateGreeting.createThread(ctx);
    
    
    const result = await thread.generateText({ 
      messages: [{ role: "user", content }],
      system: args.systemPrompt,
    });
    const aiResponse = result.text.trim();
    
    const response = {
      content: aiResponse
    }
    
    return response;
  },
});

/**
 * Required Environment Variables:
 * - API_ELEVENLABS_KEY: Set this in your Convex deployment
 */
/**
 * HTTP Request: POST
 * Generated from HTTP Request node: node_1772047247455_3z89ysq
 */
export const getApi_node_1772047247455_3z89ysq = action({
  args: {
    // Arguments expected by this HTTP request
    text: v.optional(v.any()),
    voiceId: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const method = 'POST';
    const url = 'https://integration.vibeflow.ai/api/actions/elevenlabs/text-to-speech';
    
    // Build headers
    const headers: Record<string, string> = {
          'Content-Type': 'application/json',
    };
        // Add Bearer token authentication from environment
        const apiKey = process.env.API_ELEVENLABS_KEY;
        if (!apiKey) {
          throw new Error('API_ELEVENLABS_KEY environment variable is required');
        }
        headers.Authorization = `Bearer ${apiKey}`;
    
        // Build body (fields mode)
        const bodyObj: Record<string, any> = {
        "modelId": "eleven_multilingual_v2",
        "outputFormat": "mp3_44100_128"
    };
        bodyObj['text'] = args.text ?? '';
        bodyObj['voiceId'] = args.voiceId ?? '';
    // Build body
    const body = bodyObj;
    
    try {
      console.log(`🌐 Making ${method} request to ${url}`);
    
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    
      const contentType = response.headers.get('content-type');
      let result;
    
      if (contentType?.includes('application/json')) {
        result = await response.json();
      } else if (contentType?.includes('audio/') || contentType?.includes('image/') || contentType?.includes('video/') || contentType?.includes('application/pdf') || contentType?.includes('application/octet-stream')) {
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binaryString = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binaryString += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binaryString);
        result = base64;
      } else {
        result = await response.text();
      }
    
      // Extract specific path if specified
      return result;
    } catch (error) {
      console.error(`❌ HTTP request failed:`, error);
      throw error;
    }
  },
});

/**
 * Required Environment Variables:
 * - API_ELEVENLABS_KEY: Set this in your Convex deployment
 */
/**
 * HTTP Request: POST
 * Generated from HTTP Request node: node_1772047247455_msb3enq
 */
export const getApi_node_1772047247455_msb3enq = action({
  args: {
    // Arguments expected by this HTTP request
    base64Audio: v.optional(v.any()),
    mimeType: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const method = 'POST';
    const url = 'https://integration.vibeflow.ai/api/actions/elevenlabs/speech-to-text';
    
    // Build headers
    const headers: Record<string, string> = {
          'Content-Type': 'application/json',
    };
        // Add Bearer token authentication from environment
        const apiKey = process.env.API_ELEVENLABS_KEY;
        if (!apiKey) {
          throw new Error('API_ELEVENLABS_KEY environment variable is required');
        }
        headers.Authorization = `Bearer ${apiKey}`;
    
        // Build body (fields mode)
        const bodyObj: Record<string, any> = {
        "modelId": "scribe_v2",
        "languageCode": "en"
    };
        bodyObj['base64Audio'] = args.base64Audio ?? '';
        bodyObj['mimeType'] = args.mimeType ?? '';
    // Build body
    const body = bodyObj;
    
    try {
      console.log(`🌐 Making ${method} request to ${url}`);
    
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    
      const contentType = response.headers.get('content-type');
      let result;
    
      if (contentType?.includes('application/json')) {
        result = await response.json();
      } else if (contentType?.includes('audio/') || contentType?.includes('image/') || contentType?.includes('video/') || contentType?.includes('application/pdf') || contentType?.includes('application/octet-stream')) {
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binaryString = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binaryString += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binaryString);
        result = base64;
      } else {
        result = await response.text();
      }
    
      // Extract specific path if specified
      return result;
    } catch (error) {
      console.error(`❌ HTTP request failed:`, error);
      throw error;
    }
  },
});

export const processRequest_generateCallResponse = internalAction({
  args: { input: v.any(), systemPrompt: v.optional(v.any()) },
  handler: async (ctx, args) => {
    // Convert input to string if needed
    const inputString = typeof args?.input === 'string' ? args.input : args?.input?.text || JSON.stringify(args?.input);
    
    let content = [{ type: "text", text: inputString }]
    
    if (typeof args?.input !== 'string' && args?.input?.image) {
      content.push({ type: "image", image: args.input.image });
    }
    
    // Call AI agent
    const { thread } = await generateCallResponse.createThread(ctx);
    
    
    const result = await thread.generateText({ 
      messages: [{ role: "user", content }],
      system: args.systemPrompt,
    });
    const aiResponse = result.text.trim();
    
    const response = {
      content: aiResponse
    }
    
    return response;
  },
});

/**
 * Required Environment Variables:
 * - API_ELEVENLABS_KEY: Set this in your Convex deployment
 */
/**
 * HTTP Request: POST
 * Generated from HTTP Request node: node_1772047247455_lq8dvrr
 */
export const getApi_node_1772047247455_lq8dvrr = action({
  args: {
    // Arguments expected by this HTTP request
    text: v.optional(v.any()),
    voiceId: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const method = 'POST';
    const url = 'https://integration.vibeflow.ai/api/actions/elevenlabs/text-to-speech';
    
    // Build headers
    const headers: Record<string, string> = {
          'Content-Type': 'application/json',
    };
        // Add Bearer token authentication from environment
        const apiKey = process.env.API_ELEVENLABS_KEY;
        if (!apiKey) {
          throw new Error('API_ELEVENLABS_KEY environment variable is required');
        }
        headers.Authorization = `Bearer ${apiKey}`;
    
        // Build body (fields mode)
        const bodyObj: Record<string, any> = {
        "modelId": "eleven_multilingual_v2",
        "outputFormat": "mp3_44100_128"
    };
        bodyObj['text'] = args.text ?? '';
        bodyObj['voiceId'] = args.voiceId ?? '';
    // Build body
    const body = bodyObj;
    
    try {
      console.log(`🌐 Making ${method} request to ${url}`);
    
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    
      const contentType = response.headers.get('content-type');
      let result;
    
      if (contentType?.includes('application/json')) {
        result = await response.json();
      } else if (contentType?.includes('audio/') || contentType?.includes('image/') || contentType?.includes('video/') || contentType?.includes('application/pdf') || contentType?.includes('application/octet-stream')) {
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binaryString = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binaryString += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binaryString);
        result = base64;
      } else {
        result = await response.text();
      }
    
      // Extract specific path if specified
      return result;
    } catch (error) {
      console.error(`❌ HTTP request failed:`, error);
      throw error;
    }
  },
});

export const processFlow_node_1772047247454_d5w4464 = action({
  args: {
    input: v.optional(v.any()),
  },
  handler: async (ctx, args) => {

  function getFieldOrStringify(obj: any, fieldName: string): any {
  try {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (fieldName in obj) {
      return obj[fieldName];
    }

    return JSON.stringify(obj);
  } catch (error) {
    console.error('Error in getFieldOrStringify:', error);
    return undefined;
  }
}

  // Initialize tracking data storage
  const __vibeflowTracking: Record<string, { input?: any; output?: any }> = {};

  try {
    
    __vfTrackSync(__vibeflowTracking, 'node_1772047247454_d5w4464', 'Call Turn Input', args.input, args.input);    let returnValue_node_1772047247455_05jsx79;
    let returnValue_node_1772047247455_ahzxbwo;

    // IF node node_1772047247454_jcj2aju
    const left_node_1772047247454_jcj2aju_0 = args.input?.isOpening;
    const right_node_1772047247454_jcj2aju_0 = true;
    const cond_node_1772047247454_jcj2aju_0 = left_node_1772047247454_jcj2aju_0 === right_node_1772047247454_jcj2aju_0;
    const cond_node_1772047247454_jcj2aju = cond_node_1772047247454_jcj2aju_0;
    __vfTrackSync(__vibeflowTracking, 'node_1772047247454_jcj2aju', 'Is Opening Turn?', args.input, { conditionResult: cond_node_1772047247454_jcj2aju });

    let branchResult_node_1772047247454_jcj2aju = args.input;
    if (cond_node_1772047247454_jcj2aju) {
      
    const agentResult_node_1772047247454_kgvccxc = await __vfTrack(__vibeflowTracking, 'node_1772047247454_kgvccxc', 'Generate Greeting', args.input, async () => {
      
    return  await ctx.runAction(internal.actions.processRequest_generateGreeting, {
    systemPrompt: "You are roleplaying as " + args.input?.relationship + " named " + args.input?.familyMemberName + " calling a loved one with memory difficulties. Generate a warm, brief greeting (1-2 sentences) as if you just called on the phone. Be gentle, loving, and natural.",
    input: "Generate the opening greeting for " + args.input?.familyMemberName + " calling their family member with dementia. Keep it short, warm, and natural."
    });
    });
      branchResult_node_1772047247454_jcj2aju = agentResult_node_1772047247454_kgvccxc;
      
    const httpResult_node_1772047247455_3z89ysq = await __vfTrack(__vibeflowTracking, 'node_1772047247455_3z89ysq', 'TTS Greeting', agentResult_node_1772047247454_kgvccxc, async () => {
      
    // Call HTTP request: getApi_node_1772047247455_3z89ysq (from node: node_1772047247455_3z89ysq)
    return  await ctx.runAction(api.actions.getApi_node_1772047247455_3z89ysq, {
      text: agentResult_node_1772047247454_kgvccxc?.content,
      voiceId: args.input?.voiceId,
    });
    });
      branchResult_node_1772047247454_jcj2aju = httpResult_node_1772047247455_3z89ysq;
      
    const output_node_1772047247455_2g3ahkl = await __vfTrack(__vibeflowTracking, 'node_1772047247455_2g3ahkl', 'Format Opening Response', httpResult_node_1772047247455_3z89ysq, async () => {
      

    // EDIT FIELDS node node_1772047247455_2g3ahkl
    const input_node_1772047247455_2g3ahkl = httpResult_node_1772047247455_3z89ysq;
    
    
    const setByPath_node_1772047247455_2g3ahkl = (obj: any, path: string, value: any) => {
      const keys = path.split('.');
      let ref = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (typeof ref[k] !== 'object' || ref[k] === null) ref[k] = {};
        ref = ref[k];
      }
      ref[keys[keys.length - 1]] = value;
    };
    
    const result_2g3ahkl: Record<string, any> = {};
    result_2g3ahkl["audioBase64"] = httpResult_node_1772047247455_3z89ysq?.audioBase64;
    result_2g3ahkl["greetingText"] = agentResult_node_1772047247454_kgvccxc?.content;
    return result_2g3ahkl;
  
    });
      branchResult_node_1772047247454_jcj2aju = output_node_1772047247455_2g3ahkl;
      
    returnValue_node_1772047247455_05jsx79 = await __vfTrack(__vibeflowTracking, 'node_1772047247455_05jsx79', 'Return Opening Response', output_node_1772047247455_2g3ahkl, async () => {
      
    return  output_node_1772047247455_2g3ahkl;

    });
      branchResult_node_1772047247454_jcj2aju = returnValue_node_1772047247455_05jsx79;
    } else {
      
    const httpResult_node_1772047247455_msb3enq = await __vfTrack(__vibeflowTracking, 'node_1772047247455_msb3enq', 'Transcribe Speech', args.input, async () => {
      
    // Call HTTP request: getApi_node_1772047247455_msb3enq (from node: node_1772047247455_msb3enq)
    return  await ctx.runAction(api.actions.getApi_node_1772047247455_msb3enq, {
      base64Audio: args.input?.base64Audio,
      mimeType: args.input?.mimeType,
    });
    });
      branchResult_node_1772047247454_jcj2aju = httpResult_node_1772047247455_msb3enq;
      
    const queryResult_node_1772047247455_i2m590l = await __vfTrack(__vibeflowTracking, 'node_1772047247455_i2m590l', 'Load Patient KB', args.input, async () => {
      
    // Call query: loadPatientKB (from node: node_1772047247455_i2m590l)
    return  await ctx.runQuery(internal.knowledgeBase.loadPatientKB, {
      patientId: args.input?.patientId,
    });
    });
      branchResult_node_1772047247454_jcj2aju = queryResult_node_1772047247455_i2m590l;
      
    const agentResult_node_1772047247455_8tjqzpf = await __vfTrack(__vibeflowTracking, 'node_1772047247455_8tjqzpf', 'Generate Call Response', queryResult_node_1772047247455_i2m590l, async () => {
      
    return  await ctx.runAction(internal.actions.processRequest_generateCallResponse, {
    systemPrompt: "You are roleplaying as " + args.input?.relationship + " named " + args.input?.familyMemberName + " on a phone call with a family member who has memory difficulties. Speak naturally. Be warm, patient, and loving. Keep responses to 2-3 sentences. Never argue or correct. If they seem confused, gently reassure them. Knowledge base context: " + JSON.stringify(queryResult_node_1772047247455_i2m590l),
    input: httpResult_node_1772047247455_msb3enq?.text
    });
    });
      branchResult_node_1772047247454_jcj2aju = agentResult_node_1772047247455_8tjqzpf;
      
    const mutationResult_node_1772047247455_zq9ofbv = await __vfTrack(__vibeflowTracking, 'node_1772047247455_zq9ofbv', 'Save Conversation Turn', agentResult_node_1772047247455_8tjqzpf, async () => {
      
    return  await ctx.runMutation(internal.conversations.saveConversationTurn, {
      patientId: args.input?.patientId,
      content: httpResult_node_1772047247455_msb3enq?.text,
    });
    });
      branchResult_node_1772047247454_jcj2aju = mutationResult_node_1772047247455_zq9ofbv;
      
    const httpResult_node_1772047247455_lq8dvrr = await __vfTrack(__vibeflowTracking, 'node_1772047247455_lq8dvrr', 'TTS Response', mutationResult_node_1772047247455_zq9ofbv, async () => {
      
    // Call HTTP request: getApi_node_1772047247455_lq8dvrr (from node: node_1772047247455_lq8dvrr)
    return  await ctx.runAction(api.actions.getApi_node_1772047247455_lq8dvrr, {
      text: agentResult_node_1772047247455_8tjqzpf?.content,
      voiceId: args.input?.voiceId,
    });
    });
      branchResult_node_1772047247454_jcj2aju = httpResult_node_1772047247455_lq8dvrr;
      
    const output_node_1772047247455_tcr88c2 = await __vfTrack(__vibeflowTracking, 'node_1772047247455_tcr88c2', 'Format Call Response', httpResult_node_1772047247455_lq8dvrr, async () => {
      

    // EDIT FIELDS node node_1772047247455_tcr88c2
    const input_node_1772047247455_tcr88c2 = httpResult_node_1772047247455_lq8dvrr;
    
    
    const setByPath_node_1772047247455_tcr88c2 = (obj: any, path: string, value: any) => {
      const keys = path.split('.');
      let ref = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (typeof ref[k] !== 'object' || ref[k] === null) ref[k] = {};
        ref = ref[k];
      }
      ref[keys[keys.length - 1]] = value;
    };
    
    const result_tcr88c2: Record<string, any> = {};
    result_tcr88c2["transcript"] = httpResult_node_1772047247455_msb3enq?.text;
    result_tcr88c2["responseText"] = agentResult_node_1772047247455_8tjqzpf?.content;
    result_tcr88c2["audioBase64"] = httpResult_node_1772047247455_lq8dvrr?.audioBase64;
    return result_tcr88c2;
  
    });
      branchResult_node_1772047247454_jcj2aju = output_node_1772047247455_tcr88c2;
      
    returnValue_node_1772047247455_ahzxbwo = await __vfTrack(__vibeflowTracking, 'node_1772047247455_ahzxbwo', 'Return Call Response', output_node_1772047247455_tcr88c2, async () => {
      
    return  output_node_1772047247455_tcr88c2;

    });
      branchResult_node_1772047247454_jcj2aju = returnValue_node_1772047247455_ahzxbwo;
    }

    const __finalResult = {
      Return_Opening_Response__05jsx79: returnValue_node_1772047247455_05jsx79,
      Return_Call_Response__ahzxbwo: returnValue_node_1772047247455_ahzxbwo,
    };
    return { __result: __finalResult, __vibeflowTracking };
  } catch (error) {
    // Always return tracking data even on error, so we can see what happened up to the failure point
    return {
      __result: undefined,
      __vibeflowTracking,
      __error: error instanceof Error ? error.message : String(error)
    };
  }
  },
});
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { Link } from "react-router";

const spec = {
  openapi: "3.0.0",
  info: {
    title: "AI Companion API",
    version: "1.0.0",
    description: "Backend API for the AI Companion for Dementia Patients app. All actions are Convex backend functions called via useAction() hook."
  },
  servers: [
    {
      url: "https://stoic-crane-894.convex.site",
      description: "Convex Backend (Production)"
    }
  ],
  tags: [
    { name: "Virtual Call", description: "Voice call simulation with family members using ElevenLabs TTS/STT and fine-tuned GPT" },
    { name: "Companion Chat", description: "Text-based AI companion with distress detection" },
    { name: "Dashboard", description: "Caregiver dashboard operations — requires authentication" },
    { name: "Family & KB Setup", description: "Patient knowledge base and family member management — requires authentication" }
  ],
  paths: {
    "/processFlow_callTurn": {
      post: {
        tags: ["Virtual Call"],
        summary: "Process one turn of a virtual family call",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["patientId", "familyMemberName", "relationship", "voiceId", "isOpening"],
                properties: {
                  patientId: { type: "string" },
                  familyMemberName: { type: "string" },
                  relationship: { type: "string" },
                  voiceId: { type: "string" },
                  isOpening: { type: "boolean" },
                  base64Audio: { type: "string" },
                  mimeType: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    audioBase64: { type: "string" },
                    greetingText: { type: "string", nullable: true },
                    transcript: { type: "string", nullable: true },
                    responseText: { type: "string", nullable: true }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/processFlow_chat": {
      post: {
        tags: ["Companion Chat"],
        summary: "Send a message to the AI companion",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["patientId", "message"],
                properties: {
                  patientId: { type: "string" },
                  message: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    response: { type: "string" },
                    isDistressed: { type: "boolean" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/processFlow_loadDashboard": {
      post: {
        tags: ["Dashboard"],
        summary: "Load all patients for the authenticated caregiver",
        responses: {
          200: {
            description: "Array of patient objects",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      name: { type: "string" },
                      birthYear: { type: "number" },
                      notes: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/processFlow_loadAlerts": {
      post: {
        tags: ["Dashboard"],
        summary: "Load unresolved distress alerts",
        responses: {
          200: {
            description: "Array of alert objects",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      patientId: { type: "string" },
                      triggerMessage: { type: "string" },
                      distressReason: { type: "string" },
                      resolved: { type: "boolean" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/processFlow_createPatient": {
      post: {
        tags: ["Dashboard"],
        summary: "Create a new patient profile",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                  birthYear: { type: "number" },
                  notes: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    _id: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/processFlow_resolveAlert": {
      post: {
        tags: ["Dashboard"],
        summary: "Mark a distress alert as resolved",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["alertId"],
                properties: {
                  alertId: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    resolved: { type: "boolean" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/processFlow_loadKb": {
      post: {
        tags: ["Family & KB Setup"],
        summary: "Load knowledge base entries",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["patientId"],
                properties: {
                  patientId: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Array of KB entries",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      category: { type: "string" },
                      question: { type: "string" },
                      answer: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/processFlow_addKb": {
      post: {
        tags: ["Family & KB Setup"],
        summary: "Add a knowledge base entry",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["patientId", "category", "question", "answer"],
                properties: {
                  patientId: { type: "string" },
                  category: { type: "string" },
                  question: { type: "string" },
                  answer: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    _id: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/processFlow_deleteKb": {
      post: {
        tags: ["Family & KB Setup"],
        summary: "Delete a knowledge base entry",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["kbId"],
                properties: {
                  kbId: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/processFlow_loadFam": {
      post: {
        tags: ["Family & KB Setup"],
        summary: "Load family members",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["patientId"],
                properties: {
                  patientId: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Array of family member objects",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      name: { type: "string" },
                      relationship: { type: "string" },
                      voiceId: { type: "string" },
                      greetingScript: { type: "string" },
                      avatarEmoji: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/processFlow_addFam": {
      post: {
        tags: ["Family & KB Setup"],
        summary: "Add a family member",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["patientId", "name", "relationship", "voiceId", "greetingScript"],
                properties: {
                  patientId: { type: "string" },
                  name: { type: "string" },
                  relationship: { type: "string" },
                  voiceId: { type: "string" },
                  greetingScript: { type: "string" },
                  avatarEmoji: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    _id: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export default function ApiDocs() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="min-h-[60px] py-2 border-b border-gray-200 flex items-center justify-between px-6 bg-white sticky top-0 z-50">
        <div className="flex items-center w-1/4">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 mr-4 font-medium transition-colors flex items-center gap-2">
            ← Dashboard
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center flex-1">
          <h1 className="text-xl font-bold text-gray-800">AI Companion API Documentation</h1>
          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 mt-1 font-mono border border-gray-200 select-all">
            Base URL: https://stoic-crane-894.convex.site
          </code>
        </div>
        <div className="w-1/4 flex justify-end">
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-400">OpenAPI 3.0</span>
        </div>
      </div>
      
      <div className="flex-1 swagger-wrapper">
        <style>{`
          .swagger-wrapper .swagger-ui .topbar { display: none; }
          .swagger-wrapper .swagger-ui .wrapper { padding: 0; max-width: 100%; }
        `}</style>
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
}

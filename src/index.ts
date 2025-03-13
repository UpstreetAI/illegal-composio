import { OpenAI } from "openai";
import { OpenAIToolSet } from "composio-core";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    console.log("🚀 Starting Composio quickstart demo...");

    // Initialize OpenAI and Composio clients
    console.log("📦 Initializing OpenAI and Composio clients...");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const toolset = new OpenAIToolSet({
      apiKey: process.env.COMPOSIO_API_KEY,
    });

    console.log("🔍 Finding relevant GitHub actions for the use case...");
    const actionsEnums = await toolset.client.actions.findActionEnumsByUseCase({
      apps: ["github"],
      useCase: "star a repo, print octocat",
    });
    console.log("✅ Found relevant actions:", actionsEnums);

    // Get the tools for GitHub actions
    console.log("🛠️  Getting tools for the actions...");
    const tools = await toolset.getTools({ actions: actionsEnums });

    const task = "star composiohq/composio and print me an octocat.";
    console.log("\n📝 Task:", task);

    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: task },
    ];

    console.log("\n🤖 Starting conversation loop with AI...");
    while (true) {
      console.log("\n⏳ Waiting for AI response...");
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        tools: tools,
        messages: messages,
      });

      if (!response.choices[0].message.tool_calls) {
        console.log("💬 AI Response:", response.choices[0].message.content);
        break;
      }

      console.log("🔧 Executing tool calls...");
      const result = await toolset.handleToolCall(response);
      console.log("✅ Tool execution result:", result);

      messages.push({
        role: "assistant",
        content: "",
        tool_calls: response.choices[0].message.tool_calls,
      });

      messages.push({
        role: "tool",
        content: String(result),
        tool_call_id: response.choices[0].message.tool_calls[0].id,
      });
    }

    console.log("\n✨ Demo completed successfully!");
  } catch (error) {
    console.error("❌ Error occurred:", error);
    if (error.response) {
      console.error("📄 Response data:", error.response.data);
    }
  }
}

main();

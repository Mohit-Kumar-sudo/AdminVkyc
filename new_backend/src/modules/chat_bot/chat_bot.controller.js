import HTTPStatus from "http-status";
import reportService from "./../reports/report.service";
import fetch, { Headers } from "node-fetch";
global.fetch = fetch;
global.Headers = Headers;
const { GoogleGenerativeAI } = require("@google/generative-ai");
 
const API_KEY = 'AIzaSyBZEsBGXVDVyNupvoVexXoIzo-A0Hzrfmo';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
 
const customResponses = {
  hi: "Hi, how can I assist you?",
  hello: "Hi, how can I assist you?",
  "how are you": "I'm just a chatbot, but I'm here to help!",
  thanks: "You're welcome! If you have any more questions, feel free to ask.",
  "thank you": "You're welcome! If you have any more questions, feel free to ask.",
  by: "Goodbye! Have a great day!",
  default: "I am not sure how to respond to this question. Can you ask something else?"
};
 
export async function getChatBot(req, res) {
  try {
    let text = req.body;
    console.log(text)
    text = text.text + "According to Market research future provide analysis and current market value and describe in 50 words";
    console.log("text2", text);
    const lowerCaseInput = text.toLowerCase();
    if (customResponses.hasOwnProperty(lowerCaseInput)) {
      return res.status(200).json({
        success: true,
        data: customResponses[lowerCaseInput]
      });
    }
 
    console.log("text", text);
    if (text.includes("report") || text.includes("Report")) {
      try {
        const viewData = await fetchReport("5e2032d47bd47f0004269eae");
        let newData = [];
        const me = {
          geo_segment: viewData.me.geo_segment,
          end_year: viewData.me.end_year,
          start_year: viewData.me.start_year,
          base_year: viewData.me.base_year,
          segment: viewData.me.segment
        };
 
        newData.push(me, ...viewData.toc, ...viewData.cp, ...viewData.titles, ...viewData.me.data);
        console.log("newData", newData);
 
        const prompt = `${text} \n ${JSON.stringify(newData)}`;
        const generatedText = await generateText(prompt);
        return res.status(200).json({ success: true, data: generatedText });
      } catch (error) {
        return res.status(400).json({ success: false, error: "Bad Request", details: error });
      }
    } else {
      const generatedText = await generateText(text);
      return res.status(200).json({ success: true, data: generatedText });
    }
  } catch (err) {
    console.log(err);
    return res.status(HTTPStatus.BAD_REQUEST).json(err);
  }
}
 
async function generateText(prompt) {
  try {
    const result = await model.generateContent(prompt);
    let response = await result.response.text();
    console.log("Raw response:", response);
 
    // Clean the response text
    let cleanedResponse = response
      .replace(/\n/g, " ")       // Remove new lines
      .replace(/\*\*/g, "")      // Remove bold markers (**)
      .replace(/\*/g, "")        // Remove single asterisks (*)
      .replace(/\s{2,}/g, " ");  // Remove extra spaces
 
    // Limit response to around 30 words while keeping full sentences
    let sentences = cleanedResponse.match(/[^.!?]+[.!?]/g) || [cleanedResponse];
    let finalResponse = "";
    let wordCount = 0;
 
    for (let sentence of sentences) {
      let sentenceWords = sentence.trim().split(" ");
      if (wordCount + sentenceWords.length > 50) break; // Stop if adding a sentence exceeds 30 words
      finalResponse += " " + sentence.trim();
      wordCount += sentenceWords.length;
    }
 
    console.log("Final response:", finalResponse.trim());
    return finalResponse.trim();
  } catch (error) {
    console.error("Error generating text:", error);
    return "I'm sorry, but I couldn't generate a response at this time.";
  }
}
 
 
 
export async function fetchReport(id) {
  try {
    const report = await reportService.getReportById(id);
    if (!report) {
      return { success: false, message: "Report not found" };
    } else {
      return report;
    }
  } catch (error) {
    console.log(error);
    return { success: false, error: error };
  }
}
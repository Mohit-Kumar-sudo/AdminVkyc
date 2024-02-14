import HTTPStatus from "http-status";
import reportService from "./../reports/report.service";
import Axios from "axios";
import { forEach } from "lodash";
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "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"
});

const openai = new OpenAIApi(configuration);

const customResponses = {
  hi: "Hi, how can I assist you?",
  hello: "Hi, how can I assist you?",
  "how are you": "I'm just a chatbot, but I'm here to help!",
  thanks: "You're welcome! If you have any more questions, feel free to ask.",
  "thank you":
    "You're welcome! If you have any more questions, feel free to ask.",
  by: "Goodbye! Have a great day!",
  default:
    "I am not sure how to respond this type of questions. Can you ask something else?"
};

export async function getChatBot(req, res) {
  try {
    const { text } = req.body;
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

        const toc = viewData.toc;
        const cp = viewData.cp;
        const titles = viewData.titles;

        const [firstThird, secondThird, thirdThird] = splitArrayIntoThirds(
          viewData.me.data
        );

        function splitArrayIntoThirds(array) {
          const length = array.length;
          const third = Math.floor(length / 3);
          const firstThird = array.slice(0, third);
          const secondThird = array.slice(third, 2 * third);
          const thirdThird = array.slice(2 * third);
          return [firstThird, secondThird, thirdThird];
        }

        newData.push(me, ...toc, ...cp, ...titles, ...firstThird, ...secondThird, ...thirdThird);

        console.log("newData", newData);

        return res.status(200).json({
          success: true,
          data: newData
        });

        if (viewData) {
          let completion;
          try {
            for (const list of newData) {
              completion = await openai.createCompletion({
                model: "gpt-3.5-turbo-instruct",
                prompt: text + list,
                max_tokens: 100,
                temperature: 0
              });
            }
          } catch (err) {
            if (err.response && err.response.data) {
              return res.status(400).json({
                success: false,
                error: "Bad Request",
                details: err.response.data
              });
            } else {
              console.error(err);
              return res.status(400).json({
                success: false,
                error: "Bad Request",
                details: err
              });
            }
          }
          if (completion) {
            return res.status(200).json({
              success: true,
              data: completion.data.choices[0].text
            });
          }
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
          details: error
        });
      }
    } else {
      let completion;
      try {
        completion = await openai.createCompletion({
          model: "gpt-3.5-turbo-instruct",
          prompt: text + " " + "get data only from MarketResearchFuture",
          max_tokens: 100,
          temperature: 0
        });
      } catch (err) {
        if (err.response && err.response.data) {
          console.log(err.response.data);
        } else {
          console.error(err);
        }
      }
      if (completion) {
        let chatData;
        chatData = completion.data.choices[0].text
          .replace(".com", " ")
          .replace(".Com", " ")
          .replace("MarketResearchFuture", "wizzy")
          .replace("from MarketResearchFuture", "from wizzy");

        console.log("chatData", chatData);

        const sentencesArray = chatData.split(".");
        console.log("sentencesArray", sentencesArray);
        let newCompletion =
          sentencesArray[0] +
          "." +
          sentencesArray[1] +
          "." +
          sentencesArray[2] +
          ".";
        return res.status(200).json({
          success: true,
          data: newCompletion
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(HTTPStatus.BAD_REQUEST).json(err);
  }
}

export async function fetchReport(id) {
  try {
    // let title = "Global Fertility Services market [2016-2025] Middle East and Africa by Underlying Cause"
    // let key = "MARKET_BY_REGION"
    // let chartId = "5da7c82fc249910004740637"
    // const report = await Axios.get(`http://localhost:6969/api/v1/report/chartData?id=${id}&chartId=${chartId}&title=${title}&key=${key}`);
    const report = await reportService.getReportById(id);
    if (!report) {
      return {
        success: false,
        message: "Report not found"
      };
    } else {
      return report;
    }
  } catch (error) {
    console.log(error);
    return res.status(HTTPStatus.BAD_REQUEST).json(error);
  }
}

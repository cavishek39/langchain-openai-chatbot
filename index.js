import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const URL = process.env.SUPABASE_URL;
const API_SECRET = process.env.SUPABASE_API_KEY;
const OAI_KEY = process.env.OAI_KEY;

if (!API_SECRET) throw new Error(`Expected env var API_SECRET`);

if (!URL) throw new Error(`Expected env var SUPABASE_URL`);

async function getSplittedDocuments() {
  console.log({ URL, API_SECRET, OAI_KEY });

  try {
    const text = fs.readFileSync("questionnaires.txt", "utf8");

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 1,
    });

    const output = await splitter.createDocuments([text]);

    const supabaseClient = createClient(URL, API_SECRET);

    const vector = await SupabaseVectorStore.fromDocuments(
      output,
      new OpenAIEmbeddings({ openAIApiKey: OAI_KEY }),
      {
        client: supabaseClient,
        tableName: "documents",
      }
    );

    console.log({ vector });

    // console.log(JSON.stringify(output, null, 2));
  } catch (err) {
    console.error(err);
  }
}

getSplittedDocuments();

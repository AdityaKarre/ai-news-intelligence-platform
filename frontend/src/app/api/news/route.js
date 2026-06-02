import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import Groq from 'groq-sdk';
import Parser from 'rss-parser';

// ==========================================
// 🛠️ DEVELOPER WORKSPACE CONFIGURATION FLAGS
// ==========================================
const BYPASS_CACHE_FOR_DEV = true; // Set to true to instantly see your category layouts compile on refresh

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

// Production-Vetted Multi-Source RSS Ingestion Matrix
const FEED_SOURCES = {
  india: {
    all: ['https://timesofindia.indiatimes.com/rssfeedstopstories.cms', 'https://feeds.feedburner.com/ndtvnews-top-stories'],
    technology: ['https://timesofindia.indiatimes.com/rssfeeds/66949542.cms', 'https://feeds.feedburner.com/gadgets360-latest'],
    business: ['https://timesofindia.indiatimes.com/rssfeeds/1898055.cms', 'https://feeds.feedburner.com/ndtvprofit-latest'],
    sports: ['https://timesofindia.indiatimes.com/rssfeeds/4719148.cms', 'https://feeds.feedburner.com/ndtvsports-latest'],
    entertainment: ['https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms', 'https://feeds.feedburner.com/ndtvnews-movies-latest'],
    politics: ['https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms', 'https://feeds.feedburner.com/ndtvnews-india-news']
  },
  world: {
    all: ['http://feeds.bbci.co.uk/news/world/rss.xml', 'http://rss.cnn.com/rss/edition.rss'],
    technology: ['http://feeds.bbci.co.uk/news/technology/rss.xml', 'http://rss.cnn.com/rss/edition_technology.rss'],
    business: ['http://feeds.bbci.co.uk/news/business/rss.xml', 'http://rss.cnn.com/rss/money_latest.rss'],
    sports: ['http://feeds.bbci.co.uk/sport/rss.xml', 'https://www.espn.com/espn/rss/news'],
    entertainment: ['http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', 'http://rss.cnn.com/rss/edition_entertainment.rss'],
    politics: ['http://feeds.bbci.co.uk/news/world/rss.xml', 'http://rss.cnn.com/rss/edition_politics.rss']
  }
};

const formatAIField = (val) => {
  if (Array.isArray(val)) return val.map(item => `• ${item}`).join('\n');
  if (typeof val === 'object' && val !== null) return JSON.stringify(val);
  return val ? String(val).trim() : '';
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'India';
    const category = searchParams.get('category') || 'all';

    const normalizedRegion = region.toLowerCase();
    const normalizedCategory = category.toLowerCase();

    // 1. AUTOMATIC 24-HOUR DATABASE CACHE PURGE
    await pool.query('DELETE FROM articles WHERE created_at < NOW() - INTERVAL 1 DAY');

    // 2. DEFINE EXPLICIT SQL QUERY TO RETRIEVE CATEGORY-SPECIFIC CARD ROWS
    let dbQuery, queryParams;
    if (normalizedCategory === 'all') {
      dbQuery = 'SELECT * FROM articles WHERE LOWER(region) = ? ORDER BY published_at DESC LIMIT 15';
      queryParams = [normalizedRegion];
    } else {
      dbQuery = 'SELECT * FROM articles WHERE LOWER(region) = ? AND LOWER(category) = ? ORDER BY published_at DESC LIMIT 15';
      queryParams = [normalizedRegion, normalizedCategory];
    }

    let [cachedRows] = await pool.query(dbQuery, queryParams);

    // Serve local cache storage if it contains a healthy list of records
    if (cachedRows.length >= 5 && !BYPASS_CACHE_FOR_DEV) {
      return NextResponse.json({ success: true, mode: 'production_database_cache', data: cachedRows });
    }

    // 3. TARGET RSS STREAM FEED PATHWAYS
    let targetFeedUrls = FEED_SOURCES[normalizedRegion]?.[normalizedCategory] || FEED_SOURCES[normalizedRegion]['all'];
    let compiledRawHeadlines = [];

    for (const feedUrl of targetFeedUrls) {
      try {
        const feedData = await parser.parseURL(feedUrl);
        if (feedData && feedData.items) {
          compiledRawHeadlines.push(...feedData.items.slice(0, 10));
        }
      } catch (err) {
        console.error(`Skipping broken RSS source node: ${feedUrl}`);
        continue;
      }
    }

    // 🚀 AUTOMATIC DEFENSIVE GATEWAY FALLBACK LAYER
    // If a channel's feed returns empty, instantly scrape the primary top stories stream as a backup pool
    if (compiledRawHeadlines.length === 0) {
      console.log(`⚠️ Channel [${normalizedCategory}] feed empty or down. Deploying Top Stories fallback matrix...`);
      const fallbackUrls = FEED_SOURCES[normalizedRegion]['all'];
      for (const fallbackUrl of fallbackUrls) {
        try {
          const feedData = await parser.parseURL(fallbackUrl);
          compiledRawHeadlines.push(...feedData.items.slice(0, 10));
        } catch (fErr) {
          continue;
        }
      }
    }

    // Slice overall processing pool to secure layout performance speeds
    const freshHeadlines = compiledRawHeadlines.slice(0, 8);
    let processedCount = 0;

    // 4. PARSE HEADLINES THROUGH TRUNCATION-PROOF NLP PROMPTING
    for (const story of freshHeadlines) {
      if (processedCount >= 7) break; // Secure up to 7 crisp updates for layout visibility

      const storyTitle = story.title;
      const storyLink = story.link;
      const pubDate = story.pubDate ? new Date(story.pubDate) : new Date();
      const storySnippet = story.contentSnippet || story.summary || story.content || '';

      try {
        // CLEANED UP: Pipes removed entirely from JSON layout structure to ensure seamless Groq parsing loops
        const strictPrompt = `
          You are an expert NLP content analyzer and structural news archivist.
          
          Analyze this breaking story headline alongside its source text snippet:
          Headline: "${storyTitle}"
          Source Snippet: "${storySnippet}"
          
          TASK:
          If the requested channel parameter is "all", evaluate the content and assign it the most fitting lowercase category label: "technology", "business", "sports", "entertainment", or "politics" inside the "assigned_category" key. If the channel parameter is already a specific channel category, simply return that value back inside the "assigned_category" key.

          Return a JSON object with this exact schema layout:
          {
            "assigned_category": "the matching lowercase category name goes here",
            "ai_summary": "Provide a clean, highly standalone executive summary paragraph of exactly 90 to 120 words. It must synthesize the core development, figures, or arguments in the text so that a reader fully understands the specific event without any generic filler sentences.",
            "key_drivers": "Detail the primary underlying tactical, structural, or organizational drivers directly causing this specific news event.",
            "broader_context": "Provide an analytical breakdown explaining the direct background of this event. It must be structured as exactly 3 short, continuous narrative paragraphs: Paragraph 1 details the immediate factual backstory of this scenario, Paragraph 2 details its current real-world significance, and Paragraph 3 outlines the logical next steps or immediate consequences. Do NOT include markdown subheadings, bold labels, bullet points, or macro-political fluff.",
            "potential_outcomes": "Outline exactly 2 likely short-term or long-term factual impacts resulting directly from this event."
          }
        `;

        const chatCompletion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: strictPrompt }],
          response_format: { type: 'json_object' },
          temperature: 0.15, 
        });

        const intelligenceJson = JSON.parse(chatCompletion.choices[0].message.content);

        // Safely determine row tag configuration
        const finalCategoryTag = normalizedCategory === 'all' 
          ? String(intelligenceJson.assigned_category).toLowerCase().trim()
          : normalizedCategory;

        const aiSummary = formatAIField(intelligenceJson.ai_summary);
        const keyDrivers = formatAIField(intelligenceJson.key_drivers);
        const broaderContext = formatAIField(intelligenceJson.broader_context);
        const potentialOutcomes = formatAIField(intelligenceJson.potential_outcomes);

        // 5. UPDATE LOCAL MYSQL CACHE TABLES (EXACTLY 10 COLUMN PLACEHOLDERS)
        const insertSql = `
          REPLACE INTO articles 
          (title, category, region, url, ai_summary, key_drivers, broader_context, potential_outcomes, ai_insight, published_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await pool.query(insertSql, [
          storyTitle,
          finalCategoryTag, 
          normalizedRegion,
          storyLink,
          aiSummary,
          keyDrivers,
          broaderContext,
          potentialOutcomes,
          '', 
          pubDate
        ]);

        processedCount++;

      } catch (loopError) {
        console.error(`Skipping item parsing error for headline: ${storyTitle}`, loopError.message);
        continue;
      }
    }

    // 6. RETURN RE-COLLECTED DATA ROWS BACK TO MODAL USER INTERFACE
    let [finalRows] = await pool.query(dbQuery, queryParams);
    return NextResponse.json({ success: true, mode: 'groq_70b_live_fetch', data: finalRows });

  } catch (globalError) {
    console.error('\n❌ --- ENGINE PIPELINE FAULT ENCOUNTERED --- ❌\n', globalError);
    return NextResponse.json({ success: false, error: 'Pipeline operational fault.' }, { status: 500 });
  }
}
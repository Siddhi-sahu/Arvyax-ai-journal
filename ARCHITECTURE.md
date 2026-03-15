# ArvyaX AI Journal System

This system consists of a Next.js frontend communicating with a Express backend and a PostgreSQL database (via Prisma). The frontend runs in the user’s browser and handles the user interface. When a user writes a journal entry or requests insights, the frontend calls the Express backend's REST API under /api . The backend exposes endpoints (POST /api/journal, GET /api/journal/:userId, POST /api/journal/analyze, GET /api/journal/insights/:userId) that reads/write the PostgreSQL database and integrate with the OpenAI LLM api. for example, POST /api/journal saves an entry in Postgres and returns it as json; 
POST /api/journal/analyze calls analyzeEmotion() with user's query.
analyzeEmotion() in defined llm.service.ts is basically the **'brain'**, in this file, the LLM generates emotion, keywords, and summary from user's query, and stores the results back in the same row. In summary, the data flow is:

1. User enters text -> Frontend POST to /api/journal -> Backend saves entry in Postgres (through prisma)
2. To analyze, Backend calls the LLM and updates the row with emotion, keywords andd summary.
3. On GET requests (entries or insights), the backend queries Postgres(not cached right now but could be) and returns JSON to the frontend.

I have tried the best to implement the best coding practices and to keep things modular, by clear separation of Nextjs client, express API, Postgres DB and LLM logic.

Some question you asked^^

1. How would you scale this to 100k users?
->Honestly, a single express server will start struggling well before 100k users, and LLM api calls can make it worse.
I would say, Use horizontal scaling with multiple Node.js instances behind a load balancer. In my experience, the The database starts groaning too once you're writing and reading tens of millions of entries.



The first thing I would do is make sure the API is fully stateless. also, The most intutive thing to do would be run multiple express app instances linearly as the load increases, and all instances sit behind a load balancer which routes traffic. 

Secondly, Use a managed DB to leverage high availability. 

Adding a caching layer, like redis, for caching frequent or expensive queries. or example, caching recent entries per user or common insights. Caching database queries in Redis would dramatically improves performance. Also, i would use a CDN for static frontend assets(if there are any in the future!) so users worldwide get fast load times.

Finally, using queues for any long-running tasks like calling the LLM, to background workers like RabbitMQ. Like for instance, if a user submits an entry, the API can enqueue an analysis job; a worker then calls the LLM and updates the DB. This keeps the main API responsive.

2. How would you reduce LLM cost?

LLM API calls are usually the most expensive line item in this system like these, and costs can spiral fast if we are not deliberate about it. 
The most simple and straightforward way, i made sure was to research all different types of models openAI offers. the simple ai logic in our system at this moment(like tagging a mood/pulling keywords), don't need GPT-4 or Claude Opus, a smaller(but really effficient) model like **gpt-4o-mini**  is fast, cheap, and more than capable. If we add complex anylasis later on, we can only pull out a heavy model. That tiering alone can cut costs by 80–90% on the bulk of requests. 

Since at the end of the day, everything boils down to how many tokens we are sending and receiving, the solution is simple as well. i would spend more time on prompt design, removing trailing spaces from user text, and support prompt caching for repeated prefixes.

3. How would you cache repeated analysis?

Once an entry is saved, its content doesn't change, so there's no reason to run LLM analysis on it more than once. The approach I wouldd take is to hash the entry content and use that as the Redis cache key. Before every LLM call, check the cache. If there's a hit, return it. If not, run the analysis, store the result with a 30 day TTL.

Also for aggregrated insights, I would store the computed result in a dedicated insights table. You only invalidate and recompute when a new entry comes in.


4. How would you protect sensitive journal data?

First, all data between the user should be encrypted. This means I would be using HTTPS for every client-server request, including API calls from the Next.js frontend. The database connection should also use TLS/SSL so that credentials and data are encrypted while traveling over the network. PostgreSQL can be configured to require SSL, which ensures that communication with the database remains secure.

Authentication and authorization are also essential. The application should verify users through secure methods such as sessions or tokens so that users can only access their own data. On the database side, it is best practice to avoid using a PostgreSQL superuser for the application. Instead, creating a restricted role that has only the permissions it actually needs. This follows the principle of least privilege, where each account or service is given only the minimum access required.

Finally, the infrastructure itself must be secured. Servers should run inside a private network or VPC with proper firewall rules. Sensitive values such as API keys and database credentials should be stored in environment variables. 

Together, these practices help ensure that user data remains private and protected^^
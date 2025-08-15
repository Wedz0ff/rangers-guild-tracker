import cheerio from 'cheerio';
import cacheData from 'memory-cache';

export async function GetLastMonthExperience(charName: string) {
  const parseUrl = `https://guildstats.eu/character?nick=${charName}&tab=9`;

  const cachedData = cacheData.get(parseUrl);

  if (cachedData) {
    return cachedData;
  }

  const maxAttempts = 10;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      console.log(
        `Trying to fetch data for ${charName} (attempt ${attempt + 1})`,
      );
      
      const response = await fetch(parseUrl, {
        credentials: "include",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-User": "?1",
          "Priority": "u=0, i"
        },
        referrer: `https://guildstats.eu/character?nick=${charName}&tab=3`,
        method: "GET",
        mode: "cors"
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const totalInMonth = $('tfoot th:nth-child(2)').text().trim();
      const formatedTotal = totalInMonth.replace(/[+,]/g, '');

      const timeToCache = 60 * 60 * 1000; // 1 hour

      cacheData.put(parseUrl, formatedTotal, timeToCache);
      return formatedTotal;
    } catch (error) {
      attempt++;

      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log(
          `Attempt ${attempt}: Network error for ${charName}. Retrying in 5 seconds...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else {
        console.log(`Unexpected error (${error}). Retrying in 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  console.log(
    `Failed to fetch data for ${charName} after ${maxAttempts} attempts`,
  );
  return 'Failed to fetch data';
}

export async function GetMembersFromGuild(guildName: string) {
  const parseUrl = `https://api.tibiadata.com/v4/guild/${guildName}`;

  const cachedData = cacheData.get(parseUrl);

  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(parseUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const members = data.guild.members;

    const timeToCache = 10 * 60 * 1000; // 10 minutes

    cacheData.put(parseUrl, members, timeToCache);
    return members;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log('error message: ', error.message);
      return error.message;
    } else {
      console.log('unexpected error: ', error);
      return 'An unexpected error occurred';
    }
  }
}

export async function GetMembersFromGuilds() {
  const guilds = ['Rangers', 'Rangers Academy'];

  let entries: any[] = [];

  for (const guild of guilds) {
    const guildMembers = await GetMembersFromGuild(guild);
    entries.push.apply(entries, guildMembers);
  }

  return entries;
}

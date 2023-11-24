import axios from 'axios';
import cheerio from 'cheerio';
import cacheData from 'memory-cache';

export async function GetLastMonthExperience(charName: string) {
  const parseUrl = `https://guildstats.eu/character?nick=${charName}&tab=7`;

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
      const response = await axios.get<any>(parseUrl);
      const $ = cheerio.load(response.data);
      const totalInMonth = $('tfoot th:nth-child(2)').text().trim();
      const formatedTotal = totalInMonth.replace(/[+,]/g, '');

      const timeToCache = 60 * 60 * 1000; // 1 hour

      cacheData.put(parseUrl, formatedTotal, timeToCache);
      return formatedTotal;
    } catch (error) {
      attempt++;

      if (axios.isAxiosError(error)) {
        console.log(
          `Attempt ${attempt}: Connection error for ${charName}. Retrying in 5 seconds...`,
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
  const parseUrl = `https://api.tibiadata.com/v3/guild/${guildName}`;

  const cachedData = cacheData.get(parseUrl);

  if (cachedData) {
    return cachedData;
  }

  try {
    const { data } = await axios.get<any>(parseUrl);
    const members = data.guilds.guild.members;

    const timeToCache = 10 * 60 * 1000; // 10 minutes

    cacheData.put(parseUrl, members, timeToCache);
    return members;
  } catch (error) {
    if (axios.isAxiosError(error)) {
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

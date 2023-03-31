import {
  GetLastMonthExperience,
  GetMembersFromGuilds,
} from '@/utils/GetExperience';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | { error: string }>,
) {
  try {
    const characterList = await GetMembersFromGuilds();

    const promises = characterList
      .filter((char) => char.level >= 400)
      .map((char) =>
        GetLastMonthExperience(char.name).then((experience) => ({
          name: char.name,
          rank: char.rank,
          experience,
        })),
      );

    Promise.all(promises)
      .then((responses) => {
        const responseArray = responses.filter((response) => response != null);
        console.log(responseArray);
        res.json({ data: responseArray });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

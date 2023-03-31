import { GetMembersFromGuilds } from '@/utils/GetExperience';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | { error: string }>,
) {
  try {
    const members = await GetMembersFromGuilds();
    res.json({ members });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

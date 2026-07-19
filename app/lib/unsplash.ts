import axios from "axios";

export async function getDestinationImage(destination) {
  const res = await axios.get(
    `https://api.unsplash.com/search/photos`,
    {
      params: { query: destination, per_page: 1 },
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    }
  );

  return res.data.results[0]?.urls?.regular;
}

// app/lib/weather.ts
import axios from "axios";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export interface WeatherDay {
  date: string;
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export async function fetchWeatherForecast(
  destination: string,
  days: number
): Promise<{ summary: string; forecast: WeatherDay[] } | null> {
  if (!OPENWEATHER_API_KEY) {
    console.warn("No OPENWEATHER_API_KEY — skipping weather");
    return null;
  }

  try {
    // Step 1: Geocode destination to lat/lng
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct`;
    const geoRes = await axios.get(geoUrl, {
      params: { q: destination, limit: 1, appid: OPENWEATHER_API_KEY },
      timeout: 5000,
    });

    if (!geoRes.data.length) return null;

    const { lat, lon } = geoRes.data[0];

    // Step 2: Get 5-day forecast (free tier max)
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast`;
    const { data } = await axios.get(forecastUrl, {
      params: { lat, lon, appid: OPENWEATHER_API_KEY, units: "metric" },
    });

    // Group by day (API returns 3-hour intervals)
    const dailyMap = new Map<string, any[]>();
    data.list.forEach((item: any) => {
      const date = item.dt_txt.split(" ")[0];
      if (!dailyMap.has(date)) dailyMap.set(date, []);
      dailyMap.get(date)!.push(item);
    });

    // Take one reading per day (noon if available, else first)
    const forecast: WeatherDay[] = [];
    let rainDays = 0;
    let hotDays = 0;

    Array.from(dailyMap.entries())
      .slice(0, Math.min(days, 5)) // free tier gives 5 days
      .forEach(([date, readings]) => {
        const noon =
          readings.find((r: any) => r.dt_txt.includes("12:00")) || readings[0];

        forecast.push({
          date,
          temp: Math.round(noon.main.temp),
          feelsLike: Math.round(noon.main.feels_like),
          condition: noon.weather[0].main,
          description: noon.weather[0].description,
          icon: noon.weather[0].icon,
          humidity: noon.main.humidity,
          windSpeed: noon.wind.speed,
        });

        if (["Rain", "Drizzle", "Thunderstorm"].includes(noon.weather[0].main))
          rainDays++;
        if (noon.main.temp > 30) hotDays++;
      });

    // Generate human summary
    let summary = `${days}-day forecast: `;
    if (rainDays > days / 2) summary += "Pack rain gear, wet weather expected. ";
    else if (rainDays > 0) summary += "Occasional showers, bring a light jacket. ";
    else summary += "Mostly clear skies. ";

    if (hotDays > 0) summary += "Warm temperatures, stay hydrated.";
    else summary += "Comfortable temperatures for walking.";

    return { summary, forecast };
  } catch (err) {
    console.error("Weather fetch failed:", err);
    return null;
  }
}
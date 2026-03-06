/**
 * 天气服务
 * 使用 Open-Meteo API（免费无需 API Key）
 */

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy'

export interface WeatherInfo {
  condition: WeatherCondition
  temperature: number
  humidity: number
  description: string
  icon: string
  cityName?: string
}

export interface WeatherCache {
  data: WeatherInfo
  timestamp: number
  location: string
}

// 天气代码到条件的映射
const WEATHER_CODE_MAP: Record<number, { condition: WeatherCondition; description: string }> = {
  0: { condition: 'sunny', description: '晴朗' },
  1: { condition: 'sunny', description: '晴' },
  2: { condition: 'cloudy', description: '少云' },
  3: { condition: 'cloudy', description: '多云' },
  45: { condition: 'foggy', description: '雾' },
  48: { condition: 'foggy', description: '冻雾' },
  51: { condition: 'rainy', description: '小雨' },
  53: { condition: 'rainy', description: '中雨' },
  55: { condition: 'rainy', description: '大雨' },
  61: { condition: 'rainy', description: '小雨' },
  63: { condition: 'rainy', description: '中雨' },
  65: { condition: 'rainy', description: '大雨' },
  66: { condition: 'rainy', description: '冻雨' },
  67: { condition: 'rainy', description: '大冻雨' },
  71: { condition: 'snowy', description: '小雪' },
  73: { condition: 'snowy', description: '中雪' },
  75: { condition: 'snowy', description: '大雪' },
  77: { condition: 'snowy', description: '雪粒' },
  80: { condition: 'rainy', description: '阵雨' },
  81: { condition: 'rainy', description: '中阵雨' },
  82: { condition: 'rainy', description: '大阵雨' },
  85: { condition: 'snowy', description: '阵雪' },
  86: { condition: 'snowy', description: '大阵雪' },
  95: { condition: 'stormy', description: '雷暴' },
  96: { condition: 'stormy', description: '雷暴伴小冰雹' },
  99: { condition: 'stormy', description: '雷暴伴大冰雹' }
}

// 天气对应的图标
const WEATHER_ICONS: Record<WeatherCondition, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
  foggy: '🌫️'
}

// 天气与卦象的关联（玄学趣味）
export const WEATHER_HEXAGRAM_MAP: Record<WeatherCondition, { trigram: string; hint: string }> = {
  sunny: { trigram: '乾', hint: '阳光明媚，宜积极进取' },
  cloudy: { trigram: '坤', hint: '云遮雾绕，宜静观其变' },
  rainy: { trigram: '坎', hint: '雨水润物，宜顺势而为' },
  stormy: { trigram: '震', hint: '雷声隆隆，宜谨慎行事' },
  snowy: { trigram: '艮', hint: '瑞雪纷飞，宜守正待时' },
  foggy: { trigram: '巽', hint: '迷雾漫漫，宜明辨方向' }
}

export class WeatherService {
  private cache: WeatherCache | null = null
  private readonly CACHE_DURATION = 30 * 60 * 1000
  private pendingRequest: Promise<WeatherInfo> | null = null

  async getCurrentWeather(): Promise<WeatherInfo> {
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
      console.log('[WeatherService] Returning cached weather data')
      return this.cache.data
    }

    if (this.pendingRequest) {
      console.log('[WeatherService] Waiting for pending request')
      return this.pendingRequest
    }

    this.pendingRequest = this.fetchWeatherInternal()
    try {
      return await this.pendingRequest
    } finally {
      this.pendingRequest = null
    }
  }

  private async fetchWeatherInternal(): Promise<WeatherInfo> {

    try {
      // 获取位置
      const location = await this.getLocation()
      console.log('[WeatherService] Got location:', location)

      // 获取天气
      const weather = await this.fetchWeather(location.lat, location.lon, location.city)
      console.log('[WeatherService] Got weather with city:', weather.cityName)

      // 缓存结果
      this.cache = {
        data: weather,
        timestamp: Date.now(),
        location: location.city || `${location.lat},${location.lon}`
      }

      return weather
    } catch (error) {
      console.error('[WeatherService] Failed to get weather:', error)
      // 返回缓存（即使没有城市名）或默认值
      return this.cache?.data || this.getDefaultWeather()
    }
  }

  /**
   * 根据城市名获取天气
   */
  async getWeatherByCity(city: string): Promise<WeatherInfo> {
    try {
      // 先获取城市的经纬度
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      )
      const geoData = await geoResponse.json()

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found')
      }

      const { latitude, longitude, name } = geoData.results[0]
      const weather = await this.fetchWeather(latitude, longitude)
      weather.cityName = name

      return weather
    } catch (error) {
      console.error('[WeatherService] Failed to get weather by city:', error)
      return this.getDefaultWeather()
    }
  }

  /**
   * 获取缓存的天气
   */
  getCachedWeather(): WeatherInfo | null {
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
      return this.cache.data
    }
    return null
  }

  /**
   * 获取天气对应的卦象提示
   */
  getHexagramHint(weather: WeatherInfo): { trigram: string; hint: string } {
    return WEATHER_HEXAGRAM_MAP[weather.condition]
  }

  /**
   * 从 IP 获取位置
   */
  private async getLocation(): Promise<{ lat: number; lon: number; city?: string }> {
    try {
      // 使用免费的 IP 定位服务（多个备选）
      const services = [
        { url: 'https://ipapi.co/json/', latField: 'latitude', lonField: 'longitude', cityField: 'city', regionField: 'region' },
        { url: 'https://ip-api.com/json/', latField: 'lat', lonField: 'lon', cityField: 'city', regionField: 'regionName' },
        { url: 'https://geoip.sb/geoip/', latField: 'latitude', lonField: 'longitude', cityField: 'city', regionField: 'region' }
      ]

      for (const service of services) {
        try {
          console.log(`[WeatherService] Trying IP location service: ${service.url}`)
          const response = await fetch(service.url, {
            signal: AbortSignal.timeout(5000)
          })

          if (!response.ok) {
            console.warn(`[WeatherService] Service ${service.url} returned ${response.status}`)
            continue
          }

          const data = await response.json()
          console.log(`[WeatherService] IP location data from ${service.url}:`, JSON.stringify(data))

          const lat = data[service.latField]
          const lon = data[service.lonField]
          let city = data[service.cityField]
          const region = data[service.regionField]

          // 确保坐标有效
          if (typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
            // 如果没有城市名，尝试使用 region 或组合
            if (!city && region) {
              city = region
            }

            console.log(`[WeatherService] Location found: ${city || 'Unknown'} (${lat}, ${lon})`)
            return { lat, lon, city }
          } else {
            console.warn(`[WeatherService] Invalid coordinates from ${service.url}: lat=${lat}, lon=${lon}`)
          }
        } catch (err) {
          console.warn(`[WeatherService] Failed to get location from ${service.url}:`, err)
          continue
        }
      }

      console.warn('[WeatherService] All IP location services failed, using default')
      // 所有服务都失败，使用默认值但不显示城市名
      return { lat: 30.25, lon: 120.17 } // 杭州坐标，但不显示城市名
    } catch (err) {
      console.error('[WeatherService] getLocation error:', err)
      return { lat: 30.25, lon: 120.17 }
    }
  }

  /**
   * 获取天气数据
   */
  private async fetchWeather(lat: number, lon: number, cityName?: string): Promise<WeatherInfo> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()
    const current = data.current

    const weatherCode = current.weather_code as number
    const weatherMapping = WEATHER_CODE_MAP[weatherCode] || { condition: 'sunny' as WeatherCondition, description: '未知' }

    return {
      condition: weatherMapping.condition,
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      description: weatherMapping.description,
      icon: WEATHER_ICONS[weatherMapping.condition],
      cityName: cityName
    }
  }

  /**
   * 获取默认天气（离线时使用）
   */
  private getDefaultWeather(): WeatherInfo {
    return {
      condition: 'sunny',
      temperature: 20,
      humidity: 50,
      description: '晴',
      icon: '☀️',
      cityName: '本地'
    }
  }
}

// 导出单例
export const weatherService = new WeatherService()
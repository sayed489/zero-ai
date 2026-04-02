'use client'

import { useState, useEffect } from 'react'

export type ZeroMood = 'idle' | 'happy' | 'sleepy' | 'raining' | 'thundering'

export interface WeatherData {
  city: string
  temp: string
  condition: string
  isNight: boolean
}

export interface WeatherZeroState {
  mood: ZeroMood
  badge: string
  greeting: string
  weather: WeatherData | null
  isLoading: boolean
}

// Time-based greetings
function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return "Burning the midnight oil?"
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  if (hour < 21) return "Good evening"
  return "Working late?"
}

// Weather-based conversation starters
function getWeatherDiscussion(mood: ZeroMood, weather: WeatherData | null): string {
  if (!weather) return getTimeGreeting()
  
  switch (mood) {
    case 'raining':
      return `Rainy day in ${weather.city}! Perfect weather for some indoor productivity.`
    case 'thundering':
      return `Storm brewing in ${weather.city}! Stay safe and cozy inside.`
    case 'sleepy':
      return `It's late in ${weather.city}. Should we keep it quick?`
    case 'happy':
      return `Beautiful ${weather.temp} day in ${weather.city}!`
    default:
      return `${getTimeGreeting()}! It's ${weather.temp} in ${weather.city}.`
  }
}

export function useWeatherZero() {
  const [state, setState] = useState<WeatherZeroState>({
    mood: 'idle',
    badge: '',
    greeting: getTimeGreeting(),
    weather: null,
    isLoading: true,
  })

  useEffect(() => {
    const initWeatherState = async () => {
      try {
        // Get user location
        const geoRes = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(3000),
        })
        if (!geoRes.ok) throw new Error('Geo fetch failed')
        
        const geoData = await geoRes.json()
        const { city } = geoData

        // Get weather
        const weatherRes = await fetch(`https://wttr.in/${city}?format=j1`, {
          signal: AbortSignal.timeout(3000),
        })
        if (!weatherRes.ok) throw new Error('Weather fetch failed')

        const weatherData = await weatherRes.json()
        const current = weatherData.current_condition?.[0]
        const currentTime = new Date().getHours()
        const isNight = currentTime < 6 || currentTime >= 22

        // Parse weather code
        const weatherCode = parseInt(current?.weatherCode || '0')
        const tempC = current?.temp_C || '20'
        const weatherDesc = current?.weatherDesc?.[0]?.value || 'Clear'

        const weather: WeatherData = {
          city,
          temp: `${tempC}°C`,
          condition: weatherDesc,
          isNight,
        }

        // Determine mood based on weather and time
        let mood: ZeroMood = 'idle'
        let badge = ''

        if (isNight) {
          mood = 'sleepy'
          badge = `It's late in ${city}`
        } else if ([1273, 1276, 1279, 1282].includes(weatherCode)) {
          // Thunderstorm
          mood = 'thundering'
          badge = `Storm in ${city}`
        } else if ([1063, 1072, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(weatherCode)) {
          // Rainy
          mood = 'raining'
          badge = `Raining in ${city}`
        } else if (weatherCode === 1000 && !isNight) {
          // Sunny
          mood = 'happy'
          badge = `Sunny in ${city}`
        }

        const greeting = getWeatherDiscussion(mood, weather)

        setState({
          mood,
          badge,
          greeting,
          weather,
          isLoading: false,
        })
      } catch (e) {
        // Silently fail - fallback to time-based greeting
        setState(prev => ({
          ...prev,
          greeting: getTimeGreeting(),
          isLoading: false,
        }))
      }
    }

    initWeatherState()
  }, [])

  return state
}

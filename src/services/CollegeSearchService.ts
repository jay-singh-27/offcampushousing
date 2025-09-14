import axios from 'axios';

export interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  stateCode: string;
  country: string;
  website?: string;
  type?: string; // public, private, community, etc.
  size?: number; // enrollment
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface CollegeSearchResult {
  colleges: College[];
  total: number;
  hasMore: boolean;
}

class CollegeSearchService {
  private static readonly HIPOLABS_API_BASE = 'http://universities.hipolabs.com';
  private static readonly SCORECARD_API_BASE = 'https://api.data.gov/ed/collegescorecard/v1/schools';
  
  // Cache for better performance
  private static collegeCache = new Map<string, CollegeSearchResult>();
  private static allCollegesCache: College[] | null = null;

  /**
   * Search colleges using multiple APIs
   */
  static async searchColleges(
    query: string, 
    limit: number = 20,
    country: string = 'United States'
  ): Promise<CollegeSearchResult> {
    const cacheKey = `${query}-${limit}-${country}`.toLowerCase();
    
    if (this.collegeCache.has(cacheKey)) {
      return this.collegeCache.get(cacheKey)!;
    }

    try {
      // Try Hipolabs API first (free and fast)
      const result = await this.searchWithHipolabs(query, country, limit);
      
      // Cache the result
      this.collegeCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error searching colleges:', error);
      
      // Fallback to local data if API fails
      return this.searchLocalColleges(query, limit);
    }
  }

  /**
   * Search using Hipolabs Universities API
   */
  private static async searchWithHipolabs(
    query: string,
    country: string,
    limit: number
  ): Promise<CollegeSearchResult> {
    try {
      const response = await axios.get(`${this.HIPOLABS_API_BASE}/search`, {
        params: {
          name: query,
          country: country,
        },
        timeout: 5000,
      });

      console.log('API Response for debugging:', response.data.slice(0, 2)); // Debug log
      
      const colleges: College[] = response.data
        .slice(0, limit)
        .map((uni: any, index: number) => {
          const stateProvince = uni['state-province'] || '';
          const stateCode = this.getStateCode(stateProvince);
          
          // Better city extraction logic
          let city = 'Unknown';
          if (stateProvince) {
            // For US colleges, try to extract city from common patterns
            const cityFromName = this.extractCityFromCollegeName(uni.name, stateProvince);
            city = cityFromName || this.extractCityFromDomains(uni.domains) || stateProvince.split(',')[0] || 'Unknown';
          }
          
          return {
            id: `hipolabs-${index}-${uni.name.replace(/\s+/g, '-').toLowerCase()}`,
            name: uni.name,
            city: city,
            state: stateProvince || 'Unknown',
            stateCode: stateCode,
            country: uni.country,
            website: uni.web_pages?.[0],
            type: this.determineCollegeType(uni.name),
          };
        });

      return {
        colleges,
        total: response.data.length,
        hasMore: response.data.length > limit,
      };
    } catch (error) {
      throw new Error(`Hipolabs API error: ${error}`);
    }
  }

  /**
   * Get popular colleges (for autocomplete/suggestions)
   */
  static async getPopularColleges(): Promise<College[]> {
    if (this.allCollegesCache) {
      return this.allCollegesCache.slice(0, 50); // Return top 50
    }

    try {
      // Get popular US universities
      const popularColleges = await this.getUSPopularColleges();
      this.allCollegesCache = popularColleges;
      return popularColleges;
    } catch (error) {
      console.error('Error getting popular colleges:', error);
      return this.getFallbackColleges();
    }
  }

  /**
   * Get colleges by state
   */
  static async getCollegesByState(stateCode: string): Promise<College[]> {
    try {
      const response = await axios.get(`${this.HIPOLABS_API_BASE}/search`, {
        params: {
          country: 'United States',
        },
        timeout: 10000,
      });

      const colleges: College[] = response.data
        .filter((uni: any) => 
          uni['state-province'] && 
          this.getStateCode(uni['state-province']) === stateCode.toUpperCase()
        )
        .map((uni: any, index: number) => ({
          id: `state-${stateCode}-${index}`,
          name: uni.name,
          city: this.extractCityFromDomains(uni.domains) || 'Unknown',
          state: uni['state-province'],
          stateCode: this.getStateCode(uni['state-province']),
          country: uni.country,
          website: uni.web_pages?.[0],
          type: 'university',
        }));

      return colleges;
    } catch (error) {
      console.error(`Error getting colleges for state ${stateCode}:`, error);
      return [];
    }
  }

  /**
   * Search within local/cached data
   */
  private static searchLocalColleges(query: string, limit: number): CollegeSearchResult {
    const fallbackColleges = this.getFallbackColleges();
    const searchQuery = query.toLowerCase();
    
    const filtered = fallbackColleges.filter(college =>
      college.name.toLowerCase().includes(searchQuery) ||
      college.city.toLowerCase().includes(searchQuery) ||
      college.state.toLowerCase().includes(searchQuery)
    ).slice(0, limit);

    return {
      colleges: filtered,
      total: filtered.length,
      hasMore: false,
    };
  }

  /**
   * Get popular US colleges (hardcoded for reliability)
   */
  private static async getUSPopularColleges(): Promise<College[]> {
    return [
      {
        id: 'harvard',
        name: 'Harvard University',
        city: 'Cambridge',
        state: 'Massachusetts',
        stateCode: 'MA',
        country: 'United States',
        website: 'https://www.harvard.edu',
        type: 'private',
        coordinates: { latitude: 42.3736, longitude: -71.1097 }
      },
      {
        id: 'mit',
        name: 'Massachusetts Institute of Technology',
        city: 'Cambridge',
        state: 'Massachusetts',
        stateCode: 'MA',
        country: 'United States',
        website: 'https://www.mit.edu',
        type: 'private',
        coordinates: { latitude: 42.3601, longitude: -71.0942 }
      },
      {
        id: 'stanford',
        name: 'Stanford University',
        city: 'Stanford',
        state: 'California',
        stateCode: 'CA',
        country: 'United States',
        website: 'https://www.stanford.edu',
        type: 'private',
        coordinates: { latitude: 37.4275, longitude: -122.1697 }
      },
      {
        id: 'uc-berkeley',
        name: 'University of California, Berkeley',
        city: 'Berkeley',
        state: 'California',
        stateCode: 'CA',
        country: 'United States',
        website: 'https://www.berkeley.edu',
        type: 'public',
        coordinates: { latitude: 37.8719, longitude: -122.2585 }
      },
      {
        id: 'ucla',
        name: 'University of California, Los Angeles',
        city: 'Los Angeles',
        state: 'California',
        stateCode: 'CA',
        country: 'United States',
        website: 'https://www.ucla.edu',
        type: 'public',
        coordinates: { latitude: 34.0689, longitude: -118.4452 }
      },
      {
        id: 'columbia',
        name: 'Columbia University',
        city: 'New York',
        state: 'New York',
        stateCode: 'NY',
        country: 'United States',
        website: 'https://www.columbia.edu',
        type: 'private',
        coordinates: { latitude: 40.8075, longitude: -73.9626 }
      },
      {
        id: 'nyu',
        name: 'New York University',
        city: 'New York',
        state: 'New York',
        stateCode: 'NY',
        country: 'United States',
        website: 'https://www.nyu.edu',
        type: 'private',
        coordinates: { latitude: 40.7295, longitude: -73.9965 }
      },
      {
        id: 'chicago',
        name: 'University of Chicago',
        city: 'Chicago',
        state: 'Illinois',
        stateCode: 'IL',
        country: 'United States',
        website: 'https://www.uchicago.edu',
        type: 'private',
        coordinates: { latitude: 41.7886, longitude: -87.5987 }
      },
      {
        id: 'northwestern',
        name: 'Northwestern University',
        city: 'Evanston',
        state: 'Illinois',
        stateCode: 'IL',
        country: 'United States',
        website: 'https://www.northwestern.edu',
        type: 'private',
        coordinates: { latitude: 42.0564, longitude: -87.6753 }
      },
      {
        id: 'bu',
        name: 'Boston University',
        city: 'Boston',
        state: 'Massachusetts',
        stateCode: 'MA',
        country: 'United States',
        website: 'https://www.bu.edu',
        type: 'private',
        coordinates: { latitude: 42.3505, longitude: -71.1054 }
      },
      {
        id: 'usc',
        name: 'University of Southern California',
        city: 'Los Angeles',
        state: 'California',
        stateCode: 'CA',
        country: 'United States',
        website: 'https://www.usc.edu',
        type: 'private',
        coordinates: { latitude: 34.0224, longitude: -118.2851 }
      },
      {
        id: 'uw',
        name: 'University of Washington',
        city: 'Seattle',
        state: 'Washington',
        stateCode: 'WA',
        country: 'United States',
        website: 'https://www.washington.edu',
        type: 'public',
        coordinates: { latitude: 47.6553, longitude: -122.3035 }
      },
      {
        id: 'ut-austin',
        name: 'University of Texas at Austin',
        city: 'Austin',
        state: 'Texas',
        stateCode: 'TX',
        country: 'United States',
        website: 'https://www.utexas.edu',
        type: 'public',
        coordinates: { latitude: 30.2849, longitude: -97.7341 }
      },
      {
        id: 'umich',
        name: 'University of Michigan',
        city: 'Ann Arbor',
        state: 'Michigan',
        stateCode: 'MI',
        country: 'United States',
        website: 'https://www.umich.edu',
        type: 'public',
        coordinates: { latitude: 42.2780, longitude: -83.7382 }
      },
      {
        id: 'penn',
        name: 'University of Pennsylvania',
        city: 'Philadelphia',
        state: 'Pennsylvania',
        stateCode: 'PA',
        country: 'United States',
        website: 'https://www.upenn.edu',
        type: 'private',
        coordinates: { latitude: 39.9522, longitude: -75.1932 }
      }
    ];
  }

  /**
   * Fallback colleges for offline use
   */
  private static getFallbackColleges(): College[] {
    return [
      { id: 'fallback-1', name: 'Harvard University', city: 'Cambridge', state: 'Massachusetts', stateCode: 'MA', country: 'United States' },
      { id: 'fallback-2', name: 'MIT', city: 'Cambridge', state: 'Massachusetts', stateCode: 'MA', country: 'United States' },
      { id: 'fallback-3', name: 'Stanford University', city: 'Stanford', state: 'California', stateCode: 'CA', country: 'United States' },
      { id: 'fallback-4', name: 'UC Berkeley', city: 'Berkeley', state: 'California', stateCode: 'CA', country: 'United States' },
      { id: 'fallback-5', name: 'UCLA', city: 'Los Angeles', state: 'California', stateCode: 'CA', country: 'United States' },
      { id: 'fallback-6', name: 'Columbia University', city: 'New York', state: 'New York', stateCode: 'NY', country: 'United States' },
      { id: 'fallback-7', name: 'NYU', city: 'New York', state: 'New York', stateCode: 'NY', country: 'United States' },
      { id: 'fallback-8', name: 'University of Chicago', city: 'Chicago', state: 'Illinois', stateCode: 'IL', country: 'United States' },
      { id: 'fallback-9', name: 'Northwestern University', city: 'Evanston', state: 'Illinois', stateCode: 'IL', country: 'United States' },
      { id: 'fallback-10', name: 'Boston University', city: 'Boston', state: 'Massachusetts', stateCode: 'MA', country: 'United States' },
    ];
  }

  /**
   * Helper methods
   */
  private static getStateCode(stateName: string): string {
    const stateMap: { [key: string]: string } = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
      'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
      'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
      'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
      'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
      'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
      'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
      'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
    };
    
    return stateMap[stateName?.toLowerCase()] || stateName?.toUpperCase() || 'Unknown';
  }

  private static extractCityFromCollegeName(name: string, stateProvince: string): string | null {
    // Common patterns for extracting city from college names
    const cityPatterns = [
      // "University of [City]" pattern
      /University of ([A-Za-z\s]+?)(?:\s|$|,)/i,
      // "[City] University" pattern
      /^([A-Za-z\s]+?)\s+(?:University|College|Institute)/i,
      // "College of [City]" pattern
      /College of ([A-Za-z\s]+?)(?:\s|$|,)/i,
    ];

    for (const pattern of cityPatterns) {
      const match = name.match(pattern);
      if (match && match[1]) {
        const extractedCity = match[1].trim();
        // Validate it's not just the state name
        if (extractedCity.toLowerCase() !== stateProvince.toLowerCase()) {
          return extractedCity;
        }
      }
    }

    return null;
  }

  private static determineCollegeType(name: string): string {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('community college')) return 'community';
    if (nameLower.includes('technical') || nameLower.includes('institute of technology')) return 'technical';
    if (nameLower.includes('state university') || nameLower.includes('state college')) return 'public';
    if (nameLower.includes('university')) return 'university';
    if (nameLower.includes('college')) return 'college';
    return 'university';
  }

  private static extractCityFromDomains(domains: string[]): string | null {
    // Simple heuristic to extract city from domain names
    if (!domains || domains.length === 0) return null;
    
    const domain = domains[0];
    const parts = domain.split('.');
    
    // Look for common patterns like "city.edu" or "university.city.edu"
    for (const part of parts) {
      if (part.length > 2 && !['edu', 'com', 'org', 'www'].includes(part)) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      }
    }
    
    return null;
  }
}

export default CollegeSearchService;

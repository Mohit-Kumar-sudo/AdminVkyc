const request = require('request').defaults({ encoding: null });

const { getFromRedis, setToRedis } = require('../../config/redis');

export async function getLeadsData(req, res) {
  try {
    // Generate a unique cache key based on the function name and request parameters
    const cacheKey = 'getLeadsData';

    // Check if the data is already cached in Redis
    const cachedData = await getFromRedis(cacheKey);
    if (cachedData) {
      console.log('Data found in Redis cache');
      res.send(cachedData);
      return;
    }

    // If data is not found in the cache, perform the request
    var searchUrl = 'http://172.16.0.101/industry_stats?access_key=e4e98249d561da9';
    request({
      url: searchUrl
    }, function (err, response, html) {
      if (err) {
        return res.status(500).send(err);
      }

      const responseData = html.toString();

      // Store the fetched data in the Redis cache for future use
      setToRedis(cacheKey, responseData);

      res.send(responseData);
    });

  } catch (err) {
    console.log(err);
  }
}

export async function getLeadsByCompanyName(req, res) {
  var company = req.params.company;
  try {
    // Generate a unique cache key based on the function name and request parameters
    const cacheKey = `getLeadsByCompanyName:${company}`;

    // Check if the data is already cached in Redis
    const cachedData = await getFromRedis(cacheKey);
    if (cachedData) {
      console.log('Data found in Redis cache');
      res.send(cachedData);
      return;
    }

    // If data is not found in the cache, perform the request
    var searchUrl = `http://crm.itknowledgestore.com/company_search?access_key=e4e98249d561da9&comp_name=${company}`;
    request({
      url: searchUrl
    }, function (err, response, html) {
      if (err) {
        return res.status(500).send(err);
      }

      const responseData = html.toString();

      // Store the fetched data in the Redis cache for future use
      setToRedis(cacheKey, responseData);

      res.send(responseData);
    });

  } catch (err) {
    console.log(err);
  }
}

export async function getLeadsByIndustry(req, res) {
  var industry = req.params.industry;
  try {
    // Generate a unique cache key based on the function name and request parameters
    const cacheKey = `getLeadsByIndustry:${industry}`;

    // Check if the data is already cached in Redis
    const cachedData = await getFromRedis(cacheKey);
    if (cachedData) {
      console.log('Data found in Redis cache');
      res.send(cachedData);
      return;
    }

    // If data is not found in the cache, perform the request
    var searchUrl = `http://crm.itknowledgestore.com/industry_search?access_key=e4e98249d561da9&industry=${industry}`;
    request({
      url: searchUrl
    }, function (err, response, html) {
      if (err) {
        return res.status(500).send(err);
      }

      const responseData = html.toString();

      // Store the fetched data in the Redis cache for future use
      setToRedis(cacheKey, responseData);

      res.send(responseData);
    });

  } catch (err) {
    console.log(err);
  }
}


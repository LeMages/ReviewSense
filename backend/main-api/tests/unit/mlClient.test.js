jest.mock('axios');
const axios = require('axios');
const { callMLService, ML_SERVICE_URL } = require('../../src/services/mlClient');

describe('mlClient.callMLService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should return prediction from ML service', async () => {
    axios.post.mockResolvedValueOnce({
      data: { sentiment: 'positive', confidence: 0.93 }
    });
    const result = await callMLService('This product is great');
    expect(result).toEqual({ sentiment: 'positive', confidence: 0.93 });
    expect(axios.post).toHaveBeenCalledWith(
      `${ML_SERVICE_URL}/predict`,
      { text: 'This product is great' },
      expect.objectContaining({ timeout: expect.any(Number) })
    );
  });

  test('should coerce missing / non-numeric confidence to null', async () => {
    axios.post.mockResolvedValueOnce({ data: { sentiment: 'neutral' } });
    const result = await callMLService('Some long enough text here');
    expect(result).toEqual({ sentiment: 'neutral', confidence: null });
  });

  test('should handle ML service failure gracefully', async () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    axios.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const result = await callMLService('Some long enough text here');
    expect(result).toEqual({ sentiment: null, confidence: null });
    expect(consoleWarn).toHaveBeenCalled();
    consoleWarn.mockRestore();
  });
});

/**
 * Carbon OCR Module
 * Provides utility functions for extracting data from utility bills using OCR
 */
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const { PDFExtract } = require('pdf.js-extract');
const pdfExtract = new PDFExtract();

/**
 * Extract electricity usage from an uploaded bill using OCR
 * @param {string} filePath - Path to the uploaded file
 * @returns {Promise<Object>} Extracted data
 */
exports.extractDataFromBill = async (filePath) => {
  try {
    const fileExt = path.extname(filePath).toLowerCase();
    let text = '';
    
    // Process based on file type
    if (fileExt === '.pdf') {
      text = await extractTextFromPDF(filePath);
    } else if (['.jpg', '.jpeg', '.png'].includes(fileExt)) {
      text = await extractTextFromImage(filePath);
    } else {
      throw new Error('Unsupported file format');
    }
    
    // Extract electricity usage from the text
    const extractedData = parseUtilityBill(text);
    return extractedData;
  } catch (error) {
    console.error('Error extracting data from bill:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Extract text from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromPDF(filePath) {
  try {
    const options = {};
    const data = await pdfExtract.extract(filePath, options);
    
    // Combine text from all pages
    let text = '';
    if (data && data.pages) {
      data.pages.forEach(page => {
        if (page.content) {
          page.content.forEach(item => {
            text += item.str + ' ';
          });
        }
      });
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Extract text from an image using Tesseract OCR
 * @param {string} filePath - Path to the image file
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromImage(filePath) {
  try {
    const { data } = await Tesseract.recognize(
      filePath,
      'eng',
      { logger: m => console.log(m) }
    );
    
    return data.text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
}

/**
 * Parse utility bill text to extract relevant information
 * @param {string} text - OCR extracted text
 * @returns {Object} Extracted data
 */
function parseUtilityBill(text) {
  // Initialize result object
  const result = {
    success: false,
    electricity: null,
    confidence: 0
  };
  
  // Convert text to lowercase for easier matching
  const lowerText = text.toLowerCase();
  
  // Common patterns in electricity bills
  const patterns = [
    // Pattern: "total kWh: 123" or "total kwh used: 123"
    { regex: /total\s+kwh\s*(used|consumed|:)?\s*(:|is)?\s*([\d,\.]+)/i, group: 3 },
    
    // Pattern: "electricity usage: 123 kWh"
    { regex: /electricity\s+usage\s*:?\s*([\d,\.]+)\s*kwh/i, group: 1 },
    
    // Pattern: "123 kWh" (with kWh unit)
    { regex: /([\d,\.]+)\s*kwh/i, group: 1 },
    
    // Pattern: "energy used: 123"
    { regex: /energy\s+used\s*:?\s*([\d,\.]+)/i, group: 1 },
    
    // Pattern: "current reading: 123" (may be less accurate)
    { regex: /current\s+reading\s*:?\s*([\d,\.]+)/i, group: 1 }
  ];
  
  // Try each pattern until we find a match
  for (const pattern of patterns) {
    const match = lowerText.match(pattern.regex);
    if (match && match[pattern.group]) {
      // Clean up the extracted value (remove commas)
      const rawValue = match[pattern.group].replace(/,/g, '');
      const value = parseFloat(rawValue);
      
      if (!isNaN(value)) {
        result.electricity = value;
        result.success = true;
        
        // Assign confidence based on pattern reliability
        // First patterns are more reliable than later ones
        result.confidence = 1 - (patterns.indexOf(pattern) / patterns.length);
        
        // If we found a high-confidence match, break early
        if (result.confidence > 0.7) break;
      }
    }
  }
  
  // If no electricity value was found, try to find any number that might be kWh
  if (!result.success) {
    // Look for numbers followed by units or in context
    const numberMatches = text.match(/([\d,\.]+)\s*(kw|kwh|kilowatt|units)/i);
    if (numberMatches && numberMatches[1]) {
      const value = parseFloat(numberMatches[1].replace(/,/g, ''));
      if (!isNaN(value)) {
        result.electricity = value;
        result.success = true;
        result.confidence = 0.3; // Low confidence
      }
    }
  }
  
  return result;
}
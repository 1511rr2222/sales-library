import axios from 'axios';

const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values`;

const getSheetData = async (sheetName) => {
  try {
    const response = await axios.get(`${BASE_URL}/${sheetName}`, {
      params: { key: API_KEY }
    });
    const [headers, ...rows] = response.data.values;
    return rows.map(row => {
      return headers.reduce((obj, header, index) => {
        obj[header] = row[index] || '';
        return obj;
      }, {});
    });
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error);
    return [];
  }
};

export const getMentors = () => getSheetData('mentors');
export const getCompetencies = () => getSheetData('competencies');
export const getSkills = () => getSheetData('skills');
export const getEpisodes = () => getSheetData('episodes');
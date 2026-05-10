import axios from "axios";
import { Semester } from "../models/Semesters/Semester";
import { SemestersApiResponse } from "../models/Semesters/SemestersApiResponse";
import { SemesterApiResponse } from "../models/Semesters/SemesterApiResponse";
import { SemesterPayload } from "../models/Semesters/SemesterPayload";

const API_URL = import.meta.env.VITE_API_URL + "/academic/semesters/" || "";
const API_URL_LIST = import.meta.env.VITE_API_URL + "/academic/semesters" || "";

class SemesterService {
    async getSemesters(): Promise<Semester[]>{
        try{
            const response = await axios.get<SemestersApiResponse>(API_URL_LIST);
            return response.data.data;
        }catch(error){
            if (axios.isAxiosError(error)) {
                console.error("Error de la API:", error.response?.data || error.message);
            } else {
                console.error("Error inesperado:", error);
            }
            return [];
        }
    }
    async getSemesterById(semesterId: string): Promise<Semester | null> {
        try {
            const response = await axios.get<SemesterApiResponse>(`${API_URL}${semesterId}`);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error al obtener semestre por id:', error.response?.data || error.message);
            } else {
                console.error('Error inesperado al obtener semestre por id:', error);
            }
            return null;
        }
    }

    async createSemester(payload: SemesterPayload): Promise<Semester | null> {
        try {
            const response = await axios.post<SemesterApiResponse>(API_URL_LIST, payload);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error al crear semestre:", error.response?.data || error.message);
            } else {
                console.error("Error inesperado al crear semestre:", error);
            }
            return null;
        }
    }

    async updateSemester(semesterId: string, payload: SemesterPayload): Promise<Semester | null> {
        try {
            const response = await axios.put<SemesterApiResponse>(`${API_URL}${semesterId}`, payload);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error al actualizar semestre:", error.response?.data || error.message);
            } else {
                console.error("Error inesperado al actualizar semestre:", error);
            }
            return null;
        }
    }
}

export const semesterService = new SemesterService();

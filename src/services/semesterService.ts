import axios from "axios";
import { Semester } from "../models/Semesters/Semester";
import { SemestersApiResponse } from "../models/Semesters/SemestersApiResponse";
import { SemesterApiResponse } from "../models/Semesters/SemesterApiResponse";
import { SemesterPayload } from "../models/Semesters/SemesterPayload";
import { api } from "../interceptors/authInterceptor";

const API_URL = "/academic/semesters/";
const API_URL_LIST = "/academic/semesters";

class SemesterService {
    async getSemesters(): Promise<Semester[]>{
        try{
            const response = await api.get<SemestersApiResponse>(API_URL_LIST);
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
            const response = await api.get<SemesterApiResponse>(`${API_URL}${semesterId}`);
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
            const response = await api.post<SemesterApiResponse>(API_URL_LIST, payload);
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
            const response = await api.put<SemesterApiResponse>(`${API_URL}${semesterId}`, payload);
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

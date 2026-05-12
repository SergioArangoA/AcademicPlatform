import axios from "axios";
import {StudyPlan} from "../models/StudyPlan/StudyPlan";
import { api } from "../interceptors/authInterceptor";
import { StudyPlansResponse } from "../models/StudyPlan/StudyPlansResponse";
import { StudyPlanResponse } from "../models/StudyPlan/StudyPlanResponse";
import { StudyPlanPayload } from "../models/StudyPlan/StudyPlanPayload";

const API_URL = "academic/study-plans/";
const API_URL1 = "academic/study-plans";

class StudyPlanService{
    async getStudyPlan(): Promise<StudyPlan[]>{
        try{
            const response = await api.get<StudyPlansResponse>(API_URL1);
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

    async getStudyPlanById(studyplanId: string): Promise<StudyPlan | null> {
        try {
            const response = await api.get<StudyPlanResponse>(`${API_URL}${studyplanId}`);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error al obtener el Plan de Estudio por id:', error.response?.data || error.message);
            } else {
                console.error('Error inesperado al obtener el Plan de Estudio por id:', error);
            }
            return null;
        }
    }

    async createStudyPlan(payload: StudyPlanPayload): Promise<StudyPlan | null> {
        try {
            const response = await api.post<StudyPlanResponse>(API_URL, payload);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error al crear Plan de Estudio:", error.response?.data || error.message);
            } else {
                console.error("Error inesperado al crear Plan de Estudio:", error);
            }
            return null;
        }
    }

    async updateStudyPlan(studyplanId: string, payload: StudyPlanPayload): Promise<StudyPlan | null> {
        try {
            const response = await api.put<StudyPlanResponse>(`${API_URL}${studyplanId}`, payload);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error al actualizar Plan de Estudio:", error.response?.data || error.message);
            } else {
                console.error("Error inesperado al actualizar Plan de Estudio:", error);
            }
            return null;
        }
    }

    async searchStudyPlan(name: string, year: number | string): Promise<StudyPlan[]> {
        try {
            const response = await api.get<StudyPlansResponse>(`${API_URL}search`, {
                params: {   ...(name && { name }), 
                            ...(year && { year })
                        },
            });
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error al buscar Plan de Estudio:", error.response?.data || error.message);
            } else {
                console.error("Error inesperado al buscar Plan de Estudio:", error);
            }
            return [];
        }
    }

    async deleteStudyPlan(id: number | string): Promise<boolean> {
        try {
            await api.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar materia:", error);
            return false;
        }
    }
}

export const studyplanService = new StudyPlanService();

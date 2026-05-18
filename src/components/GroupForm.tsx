/**
 * Formulario que uso para crear y editar grupos.
 * mode 1 = pantalla "Nuevo grupo", mode 2 = editar uno existente.
 * Cargo asignaturas, docentes y el semestre activo al abrir la página.
 */
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Group } from "../models/Groups/Group";
import { GroupPayload } from "../models/Groups/GroupPayload";
import { Semester } from "../models/Semesters/Semester";
import { Subject } from "../models/Subjects/Subject";
import { Teacher } from "../models/Teachers/Teacher";
import { semesterService } from "../services/semesterService";
import { subjectService } from "../services/subjectService";
import { teacherService } from "../services/teacherService";

interface GroupFormProps {
    mode: 1 | 2;
    group?: Group | null;
    loading?: boolean;
    onSubmit: (values: GroupPayload) => Promise<void> | void;
}

interface GroupFormValues {
    subject_id: string;
    name: string;
    group_code: string;
    capacity: string;
    teacher_id: string;
}

const GroupForm: React.FC<GroupFormProps> = ({ mode, group, loading = false, onSubmit }) => {
    const navigate = useNavigate();
    const isEditMode = mode === 2;
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [activeSemester, setActiveSemester] = useState<Semester | null>(null);

    useEffect(() => {
        const loadCatalogs = async () => {
            const [subjectsData, teachersData, semesters] = await Promise.all([
                subjectService.getSubjects(),
                teacherService.searchTeacher(""),
                semesterService.getSemesters(),
            ]);
            setSubjects(subjectsData.filter((s) => s.is_active));
            setTeachers(teachersData);
            setActiveSemester(semesters.find((s) => s.is_active) ?? null);
        };
        loadCatalogs();
    }, []);

    const validationSchema = Yup.object({
        subject_id: Yup.string().required("La asignatura es obligatoria"),
        name: Yup.string().required("El nombre es obligatorio"),
        group_code: Yup.string().required("El código de grupo es obligatorio"),
        capacity: Yup.number()
            .typeError("El cupo debe ser un número válido")
            .required("El cupo es obligatorio")
            .moreThan(0, "El cupo debe ser mayor a cero")
            .integer("El cupo debe ser un número entero"),
        teacher_id: Yup.string().required(
            "El docente es obligatorio (la API actual exige teacher_id al crear el grupo)"
        ),
    });

    const initialValues: GroupFormValues = {
        subject_id: group?.subject_id ? String(group.subject_id) : "",
        name: group?.name || "",
        group_code: group?.group_code || "",
        capacity: group?.capacity !== undefined ? String(group.capacity) : "",
        teacher_id: group?.teacher_id ? String(group.teacher_id) : "",
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            onSubmit={(values) => {
                if (!activeSemester?.id) return;
                onSubmit({
                    subject_id: values.subject_id,
                    semester_id: String(activeSemester.id),
                    teacher_id: values.teacher_id,
                    name: values.name.trim(),
                    group_code: values.group_code.trim().toUpperCase(),
                    capacity: Number(values.capacity),
                });
            }}
        >
            <Form className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {isEditMode ? "Editar grupo" : "Nuevo grupo"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Semestre activo (asignado automáticamente):{" "}
                        {activeSemester?.name ?? "No hay semestre activo — actívalo en Carreras/Semestres"}
                    </p>
                    {!isEditMode && (
                        <p className="mt-1 text-xs text-amber-600">
                            Por ahora el backend pide elegir docente al crear el grupo.
                        </p>
                    )}
                </div>

                <div className="space-y-5 px-6 py-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Asignatura
                        </label>
                        <Field
                            as="select"
                            name="subject_id"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                        >
                            <option value="">Selecciona una asignatura</option>
                            {subjects.map((subject) => (
                                <option key={subject.id} value={String(subject.id)}>
                                    {subject.code} — {subject.name}
                                </option>
                            ))}
                        </Field>
                        <ErrorMessage name="subject_id" component="p" className="mt-1 text-sm text-red-500" />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nombre del grupo
                        </label>
                        <Field
                            name="name"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                        />
                        <ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-500" />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Código de grupo
                        </label>
                        <Field
                            name="group_code"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                        />
                        <ErrorMessage name="group_code" component="p" className="mt-1 text-sm text-red-500" />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Cupo máximo
                        </label>
                        <Field
                            name="capacity"
                            type="number"
                            min={1}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                        />
                        <ErrorMessage name="capacity" component="p" className="mt-1 text-sm text-red-500" />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Docente
                        </label>
                        <Field
                            as="select"
                            name="teacher_id"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                        >
                            <option value="">Selecciona un docente</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={String(teacher.id)}>
                                    {[teacher.first_name, teacher.last_name].filter(Boolean).join(" ")}
                                </option>
                            ))}
                        </Field>
                        <ErrorMessage name="teacher_id" component="p" className="mt-1 text-sm text-red-500" />
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/groups/list")}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:text-gray-200"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !activeSemester}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {loading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear grupo"}
                    </button>
                </div>
            </Form>
        </Formik>
    );
};

export default GroupForm;

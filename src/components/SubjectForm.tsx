import { ErrorMessage, Field, Form, Formik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Subject } from "../models/Subject";
import { SubjectPayload } from "../models/SubjectPayload";

interface SubjectFormProps {
    mode: 1 | 2;
    subject?: Subject | null;
    loading?: boolean;
    onSubmit: (values: SubjectPayload) => Promise<void> | void;
}

interface SubjectFormValues {
    code: string;
    name: string;
    description: string;
    credits: string;
}

const SubjectForm: React.FC<SubjectFormProps> = ({ mode, subject, loading = false, onSubmit }) => {
    const navigate = useNavigate();
    const isEditMode = mode === 2;

    const validationSchema = Yup.object({
        code: Yup.string().required("El código es obligatorio"),
        name: Yup.string().required("El nombre es obligatorio"),
        description: Yup.string()
            .required("La descripción es obligatoria")
            .max(250, "La descripción no puede superar 250 caracteres"),
        credits: Yup.number()
            .typeError("Los créditos deben ser un número válido")
            .required("Los créditos son obligatorios")
            .moreThan(0, "Debe ser un número mayor a 0")
            .integer("Los créditos deben ser un número entero"),
    });

    const initialValues: SubjectFormValues = {
        code: subject?.code || "",
        name: subject?.name || "",
        description: subject?.description || "",
        credits: subject?.credits !== undefined && subject?.credits !== null ? String(subject.credits) : "",
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            onSubmit={(values) =>
                onSubmit({
                    code: values.code.trim().toUpperCase(),
                    name: values.name.trim(),
                    description: values.description.trim(),
                    credits: Number(values.credits),
                })
            }
        >
            {({ values, setFieldValue, errors, touched }) => (
                <Form className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-700">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                {isEditMode ? "Editar asignatura" : "Nueva asignatura"}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/admin/subjects-list")}
                            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
                            aria-label="Cerrar formulario"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-5 px-6 py-6">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Código {isEditMode ? <span className="text-gray-500">(no editable)</span> : <span className="text-red-500">*</span>}
                            </label>
                            <Field
                                name="code"
                                disabled={isEditMode}
                                placeholder="Ej. BD102"
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
                                    isEditMode
                                        ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                        : "border-gray-300 dark:border-gray-600"
                                }`}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    const uppercased = event.target.value.toUpperCase();
                                    setFieldValue("code", uppercased);
                                }}
                            />
                            <ErrorMessage name="code" component="p" className="mt-1 text-sm text-red-500" />
                            {isEditMode && (
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    El código no puede ser modificado.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <Field
                                name="name"
                                placeholder="Ej. Bases de Datos"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            <ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-500" />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Descripción <span className="text-red-500">*</span>
                            </label>
                            <Field
                                as="textarea"
                                name="description"
                                rows={5}
                                maxLength={250}
                                placeholder="Describe la asignatura..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <ErrorMessage name="description" component="p" className="text-sm text-red-500" />
                                <span>{values.description.length}/250</span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Créditos <span className="text-red-500">*</span>
                            </label>
                            <Field
                                name="credits"
                                type="number"
                                min="1"
                                placeholder="Ej. 4"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            <ErrorMessage name="credits" component="p" className="mt-1 text-sm text-red-500" />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Debe ser un número mayor a 0.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 dark:border-gray-700 dark:bg-gray-900/40">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/subjects-list")}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isEditMode ? "Guardar cambios" : "Guardar"}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default SubjectForm;
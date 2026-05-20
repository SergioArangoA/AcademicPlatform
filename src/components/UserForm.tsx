import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { UserResponse } from "../models/Users/UserResponse";
import { UpdateUserPayload } from "../models/Users/UpdateUserPayload";
import { UserFormProps } from "../models/Components/UserFormProps";


const UserFormValidator: React.FC<UserFormProps> = ({mode, handleAction, user,}) => {
    const [activeTab, setActiveTab] = useState<"user" | "profile">("user");
    const isReadOnly = mode === 3;
    const profile = user && "profile" in user ? user.profile : null;
    const hasProfile = Boolean(profile);
    const isStudentOrTeacher = user?.role === "STUDENT" || user?.role === "TEACHER";

    // Esquema de validación
    const validationSchema = Yup.object({
        email: Yup.string().email("Email inválido").required("El email es obligatorio"),
        code: Yup.string().required("El código es obligatorio"),
        role: Yup.string().oneOf(["STUDENT", "TEACHER", "ADMIN"]).required("El rol es obligatorio"),

        // Contraseña requerida al crear, opcional al editar pero validada si se proporciona
        ...(mode === 1 ? {
            password: Yup.string()
                .min(8, "La contraseña debe tener al menos 8 caracteres")
                .required("La contraseña es obligatoria"),
        } : mode === 2 ? {
            password: Yup.string()
                .min(8, "La contraseña debe tener al menos 8 caracteres")
                .optional(),
        } : {}),

        // Datos de perfil (no requeridos para ADMIN)
        ...(mode === 1 || hasProfile ? {
            first_name: Yup.string().required("El nombre es obligatorio"),
            last_name: Yup.string().required("El apellido es obligatorio"),
            identification: Yup.string().required("La identificación es obligatoria"),
        } : {}),

        // Campos específicos para docentes
        ...(mode === 1 && {
            phone: Yup.string().matches(/^\d{10}$/, "El teléfono debe tener 10 dígitos").nullable(),
            specialty: Yup.string().nullable(),
        }),
    });

    const initialValues = {
        id: user?.id || "",
        email: user?.email || "",
        code: user?.code || "",
        role: user?.role || "STUDENT",
        password: "",
        first_name: isStudentOrTeacher ? profile?.first_name || "" : "",
        last_name: isStudentOrTeacher ? profile?.last_name || "" : "",
        identification: isStudentOrTeacher ? profile?.identification || "" : "",
        phone: user?.role === "TEACHER" ? profile && "phone" in profile ? profile.phone || "" : "" : "",
        specialty: user?.role === "TEACHER" ? profile && "specialty" in profile ? profile.specialty || "" : "" : "",
        is_active: user?.is_active ?? true,
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                if (isReadOnly) {
                    return;
                }

                // Normalizar `is_active`: puede venir como string desde el select o como boolean
                const isActive = typeof values.is_active === "string"
                    ? values.is_active === "true"
                    : Boolean(values.is_active);
                
                const payload: UpdateUserPayload = {
                    email: values.email,
                    code: values.code,
                    ...(mode !== 1 && { is_active: isActive }),
                    first_name: values.first_name,
                    last_name: values.last_name,
                    identification: values.identification,
                    ...(values.password && { password: values.password }),
                    phone: values.role === "TEACHER" ? String(values.phone || "") : undefined,
                    specialty: values.role === "TEACHER" ? String(values.specialty || "") : undefined,
                };
                handleAction(payload, values.role as "ADMIN" | "STUDENT" | "TEACHER");
            }}
        >
            {({ values, setFieldValue }) => (
                <Form className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                type="button"
                                onClick={() => setActiveTab("user")}
                                className={`flex-1 py-4 text-center font-medium transition-colors ${
                                    activeTab === "user"
                                        ? "border-b-4 border-green-600 text-green-700"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Datos de usuario
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("profile")}
                                className={`flex-1 py-4 text-center font-medium transition-colors ${
                                    activeTab === "profile"
                                        ? "border-b-4 border-green-600 text-green-700"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Datos de perfil
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* ===================== TAB 1: Datos de usuario ===================== */}
                        {activeTab === "user" && (
                            <div className="space-y-5">
                                {mode === 2 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ID
                                        </label>
                                        <Field
                                            name="id"
                                            disabled={isReadOnly}
                                            readOnly
                                            className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <Field
                                        type="email"
                                        name="email"
                                        disabled={isReadOnly}
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                                    />
                                    <ErrorMessage name="email" component="p" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Código *
                                        </label>
                                        <Field
                                            type="text"
                                            name="code"
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded-lg p-3"
                                            placeholder="Ej: DOC001 o EST001"
                                        />
                                        <ErrorMessage name="code" component="p" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rol *
                                        </label>
                                        <Field
                                            as="select"
                                            name="role"
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded-lg p-3"
                                            onChange={(e: any) => {
                                                setFieldValue("role", e.target.value);
                                            }}
                                        >
                                            <option value="STUDENT">Estudiante</option>
                                            <option value="TEACHER">Docente</option>
                                            <option value="ADMIN">Administrador</option>
                                        </Field>
                                        <ErrorMessage name="role" component="p" className="text-red-500 text-sm mt-1" />
                                    </div>
                                </div>

                                {(mode === 1 || mode === 2) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Contraseña {mode === 1 ? "*" : "(opcional)"}
                                        </label>
                                        <Field
                                            type="password"
                                            name="password"
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded-lg p-3"
                                            placeholder={mode === 1 ? "Mínimo 8 caracteres" : "Dejar en blanco para mantener la actual"}
                                        />
                                        <ErrorMessage name="password" component="p" className="text-red-500 text-sm mt-1" />
                                    </div>
                                )}

                                {mode !== 1 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estado
                                        </label>
                                        <Field
                                            as="select"
                                            name="is_active"
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded-lg p-3"
                                        >
                                            <option value="true">Activo</option>
                                            <option value="false">Inactivo</option>
                                        </Field>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===================== TAB 2: Datos de perfil ===================== */}
                        {activeTab === "profile" && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre(s) *
                                        </label>
                                        <Field
                                            type="text"
                                            name="first_name"
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded-lg p-3"
                                        />
                                        <ErrorMessage name="first_name" component="p" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Apellido(s) *
                                        </label>
                                        <Field
                                            type="text"
                                            name="last_name"
                                            disabled={isReadOnly}
                                            className="w-full border border-gray-300 rounded-lg p-3"
                                        />
                                        <ErrorMessage name="last_name" component="p" className="text-red-500 text-sm mt-1" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cédula / Identificación *
                                    </label>
                                    <Field
                                        type="text"
                                        name="identification"
                                        disabled={isReadOnly}
                                        className="w-full border border-gray-300 rounded-lg p-3"
                                    />
                                    <ErrorMessage name="identification" component="p" className="text-red-500 text-sm mt-1" />
                                </div>

                                {/* Campos específicos según rol */}
                                {(values.role === "TEACHER" || user?.role === "TEACHER") && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono
                                            </label>
                                            <Field
                                                type="text"
                                                name="phone"
                                                disabled={isReadOnly}
                                                className="w-full border border-gray-300 rounded-lg p-3"
                                                placeholder="3001234567"
                                            />
                                            <ErrorMessage name="phone" component="p" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Especialidad
                                            </label>
                                            <Field
                                                type="text"
                                                name="specialty"
                                                disabled={isReadOnly}
                                                className="w-full border border-gray-300 rounded-lg p-3"
                                                placeholder="Inteligencia Artificial, Matemáticas, etc."
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Botones - Siempre visibles */}
                    <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t bg-gray-50 shadow-lg">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium text-gray-700"
                        >
                            {isReadOnly ? "Volver" : "Cancelar"}
                        </button>
                        {!isReadOnly && (
                            <button
                                type="submit"
                                className="px-8 py-2.5 bg-green-600 text-black rounded-lg hover:bg-green-700 active:bg-green-800 transition font-semibold shadow-md"
                            >
                                {mode === 1 ? "Guardar usuario" : "Guardar cambios"}
                            </button>
                        )}
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default UserFormValidator;
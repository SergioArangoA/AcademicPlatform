import { Form, ErrorMessage, Field, Formik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Semester } from "../models/Semesters/Semester";
import { SemesterPayload } from "../models/Semesters/SemesterPayload";

interface SemesterFormProps {
	mode: 1 | 2;
	semester?: Semester | null;
	loading?: boolean;
	onSubmit: (values: SemesterPayload) => Promise<void> | void;
}

interface SemesterFormValues {
	code: string;
	name: string;
	start_date: string;
	end_date: string;
	is_active: "true" | "false";
}

const toDateInput = (value?: string) => {
	if (!value) {
		return "";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return date.toISOString().slice(0, 10);
};

const SemesterForm: React.FC<SemesterFormProps> = ({
	mode,
	semester,
	loading = false,
	onSubmit,
}) => {
	const navigate = useNavigate();
	const isEditMode = mode === 2;

	const validationSchema = Yup.object({
		code: Yup.string().required("El código es obligatorio"),
		name: Yup.string().required("El nombre es obligatorio"),
		start_date: Yup.string().required("La fecha de inicio es obligatoria"),
		end_date: Yup.string()
			.required("La fecha de fin es obligatoria")
			.test("end-after-start", "La fecha de fin debe ser mayor o igual a la fecha de inicio", function (value) {
				const { start_date: startDate } = this.parent as SemesterFormValues;
				if (!startDate || !value) {
					return true;
				}
				return new Date(value) >= new Date(startDate);
			}),
		is_active: Yup.string().oneOf(["true", "false"]),
	});

	const initialValues: SemesterFormValues = {
		code: semester?.code || "",
		name: semester?.name || "",
		start_date: toDateInput(semester?.start_date),
		end_date: toDateInput(semester?.end_date),
		is_active: semester?.is_active ? "true" : "false",
	};

	return (
		<Formik
			initialValues={initialValues}
			validationSchema={validationSchema}
			enableReinitialize
			onSubmit={(values) => {
				const payload: SemesterPayload = {
					code: values.code,
					name: values.name,
					start_date: values.start_date,
					end_date: values.end_date,
					...(isEditMode && { is_active: values.is_active === "true" }),
				};

				onSubmit(payload);
			}}
		>
			{({ setFieldValue }) => (
				<Form className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
					<div className="flex items-start justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-700">
						<h2 className="text-xl font-semibold text-gray-800 dark:text-white">
							{isEditMode ? "Editar semestre" : "Nuevo semestre"}
						</h2>
						<button
							type="button"
							onClick={() => navigate("/admin/careers-semesters?tab=semesters")}
							className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
							aria-label="Cerrar formulario"
						>
							<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div className="space-y-5 px-6 py-6">
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
									Código <span className="text-red-500">*</span>
								</label>
								<Field
									name="code"
									placeholder="Ej. 2024-1"
									className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
									onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
										setFieldValue("code", event.target.value.toUpperCase());
									}}
								/>
								<ErrorMessage name="code" component="p" className="mt-1 text-sm text-red-500" />
							</div>

							<div>
								<label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
									Nombre <span className="text-red-500">*</span>
								</label>
								<Field
									name="name"
									placeholder="Ej. 2024 - I"
									className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
								<ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-500" />
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
									Fecha inicio <span className="text-red-500">*</span>
								</label>
								<Field
									type="date"
									name="start_date"
									className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
								<ErrorMessage name="start_date" component="p" className="mt-1 text-sm text-red-500" />
							</div>

							<div>
								<label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
									Fecha fin <span className="text-red-500">*</span>
								</label>
								<Field
									type="date"
									name="end_date"
									className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
								<ErrorMessage name="end_date" component="p" className="mt-1 text-sm text-red-500" />
							</div>
						</div>

						{isEditMode && (
							<div>
								<label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
									Estado <span className="text-red-500">*</span>
								</label>
								<Field
									as="select"
									name="is_active"
									className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								>
									<option value="true">Activo</option>
									<option value="false">Inactivo</option>
								</Field>
								<div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-200">
									Al activar este semestre, el sistema desactivará automáticamente el semestre activo actual.
								</div>
							</div>
						)}
					</div>

					<div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 dark:border-gray-700 dark:bg-gray-900/40">
						<button
							type="button"
							onClick={() => navigate("/admin/careers-semesters?tab=semesters")}
							className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={loading}
							className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isEditMode ? "Guardar cambios" : "Guardar semestre"}
						</button>
					</div>
				</Form>
			)}
		</Formik>
	);
};

export default SemesterForm;
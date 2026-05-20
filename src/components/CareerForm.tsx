import { Form, ErrorMessage, Field, Formik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Career } from "../models/Careers/Career";
import { CareerPayload } from "../models/Careers/CareerPayload";
import { CareerFormProps } from "../models/Components/CareerFormProps";

const CareerForm: React.FC<CareerFormProps> = ({ mode, career, loading = false, onSubmit }) => {
	const navigate = useNavigate();
	const isEditMode = mode === 2;

	const validationSchema = Yup.object({
		code: Yup.string().required("El código es obligatorio"),
		name: Yup.string().required("El nombre es obligatorio"),
		description: Yup.string().max(200, "La descripción no puede superar 200 caracteres"),
	});

	const initialValues: CareerPayload = {
		code: career?.code || "",
		name: career?.name || "",
		description: career?.description || "",
	};

	return (
		<Formik
			initialValues={initialValues}
			validationSchema={validationSchema}
			enableReinitialize
			onSubmit={onSubmit}
		>
			{({ values, setFieldValue }) => (
				<Form className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
					<div className="flex items-start justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-700">
						<div>
							<h2 className="text-xl font-semibold text-gray-800 dark:text-white">
								{isEditMode ? "Editar carrera" : "Nueva carrera"}
							</h2>
						</div>
						<button
							type="button"
							onClick={() => navigate("/admin/careers-semesters")}
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
								Código <span className="text-red-500">*</span>
							</label>
							<Field
								name="code"
								disabled={isEditMode}
								placeholder="Ej. ING-SIS"
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
								placeholder="Ej. Ingeniería de Sistemas"
								className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
							<ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-500" />
						</div>

						<div>
							<label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
								Descripción
							</label>
							<Field
								as="textarea"
								name="description"
								rows={5}
								maxLength={200}
								placeholder="Describe la carrera..."
								className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
							<div className="mt-2 flex items-center justify-end text-xs text-gray-500 dark:text-gray-400">
								<span>{values.description.length}/200</span>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 dark:border-gray-700 dark:bg-gray-900/40">
						<button
							type="button"
							onClick={() => navigate("/admin/careers-semesters")}
							className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={loading}
							className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isEditMode ? "Guardar cambios" : "Guardar carrera"}
						</button>
					</div>
				</Form>
			)}
		</Formik>
	);
};

export default CareerForm;
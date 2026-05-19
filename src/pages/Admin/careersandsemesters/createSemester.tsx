import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Breadcrumb from "../../../components/Breadcrumb";
import SemesterForm from "../../../components/SemesterForm";
import { SemesterPayload } from "../../../models/Semesters/SemesterPayload";
import { semesterService } from "../../../services/semesterService";

const CreateSemester = () => {
	const navigate = useNavigate();

	const handleCreateSemester = async (values: SemesterPayload) => {
		try {
			const semesterLabel = values.name || values.code || "este semestre";
			const confirmation = await Swal.fire({
				title: "Confirmar creación",
				text: `¿Seguro que desea guardar el semestre "${semesterLabel}"?`,
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: "Sí, guardar semestre",
				cancelButtonText: "Cancelar",
				reverseButtons: true,
			});

			if (!confirmation.isConfirmed) {
				return;
			}

			const createdSemester = await semesterService.createSemester(values);

			if (createdSemester) {
				await Swal.fire({
					title: "Completado",
					text: "Se ha creado correctamente el semestre",
					icon: "success",
					timer: 3000,
				});
				navigate("/admin/careers-semesters?tab=semesters");
				return;
			}

			throw new Error("No se pudo crear el semestre");
		} catch (error) {
			console.error("Error al crear semestre:", error);
			Swal.fire({
				title: "Error",
				text: "Existe un problema al momento de crear el registro",
				icon: "error",
				timer: 3000,
			});
		}
	};

	return (
		<>
			<Breadcrumb pageName="Nuevo semestre" />
			<SemesterForm mode={1} onSubmit={handleCreateSemester} />
		</>
	);
};

export default CreateSemester;
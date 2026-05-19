import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Breadcrumb from "../../../components/Breadcrumb";
import CareerForm from "../../../components/CareerForm";
import { CareerPayload } from "../../../models/Careers/CareerPayload";
import { careerService } from "../../../services/careerService";

const CreateCareer = () => {
	const navigate = useNavigate();

	const handleCreateCareer = async (values: CareerPayload) => {
		try {
			const careerLabel = values.name || values.code || "esta carrera";
			const confirmation = await Swal.fire({
				title: "Confirmar creación",
				text: `¿Seguro que desea guardar la carrera "${careerLabel}"?`,
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: "Sí, guardar carrera",
				cancelButtonText: "Cancelar",
				reverseButtons: true,
			});

			if (!confirmation.isConfirmed) {
				return;
			}

			const createdCareer = await careerService.createCareer(values);

			if (createdCareer) {
				await Swal.fire({
					title: "Completado",
					text: "Se ha creado correctamente la carrera",
					icon: "success",
					timer: 3000,
				});
				navigate("/admin/careers-semesters");
				return;
			}

			throw new Error("No se pudo crear la carrera");
		} catch (error) {
			console.error("Error al crear carrera:", error);
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
			<Breadcrumb pageName="Nueva carrera" />
			<CareerForm mode={1} onSubmit={handleCreateCareer} />
		</>
	);
};

export default CreateCareer;
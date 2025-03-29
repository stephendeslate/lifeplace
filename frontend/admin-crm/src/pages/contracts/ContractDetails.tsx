// frontend/admin-crm/src/pages/contracts/ContractDetails.tsx
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Block as VoidIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from "@mui/material";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/common/Layout";
import {
  ContractDetail,
  ContractSignatureForm,
  ContractViewer,
} from "../../components/contracts";
import useAuth from "../../hooks/useAuth";
import { useEventContract } from "../../hooks/useContracts";
import { ContractSignatureData } from "../../types/contracts.types";

const ContractDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const contractId = id ? parseInt(id) : 0;
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for dialogs
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);

  // Get contract data
  const {
    contract,
    isLoading,
    error,
    signContract,
    isSigning,
    updateContract,
    isUpdating,
  } = useEventContract(contractId);

  // Handle navigation back to event
  const handleBackToEvent = () => {
    if (!contract) return;

    const eventId =
      typeof contract.event === "object" ? contract.event.id : contract.event;

    navigate(`/events/${eventId}`);
  };

  // Handle send contract
  const handleSendContract = () => {
    if (!contract) return;

    updateContract({ status: "SENT" });
    setSendDialogOpen(false);
  };

  // Handle void contract
  const handleVoidContract = () => {
    if (!contract) return;

    updateContract({ status: "VOID" });
    setVoidDialogOpen(false);
  };

  // Handle sign contract
  const handleSignContract = (data: ContractSignatureData) => {
    signContract(data);
    setSignDialogOpen(false);
  };

  // Generate PDF from contract
  const handleDownloadPdf = async () => {
    const element = document.getElementById("printable-contract");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true, // If there are any images
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // Standard A4 size
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const aspectRatio = canvas.width / canvas.height;
      const imgWidth = pdfWidth;
      const imgHeight = imgWidth / aspectRatio;

      // Calculate the number of pages needed
      const pageCount = Math.ceil(imgHeight / pdfHeight);

      // Add each page
      for (let i = 0; i < pageCount; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        // Calculate which portion of the image to show on this page
        const srcY = i * (canvas.height / pageCount);
        const srcHeight = canvas.height / pageCount;

        // Create a temporary canvas for this page
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = srcHeight;

        const ctx = tmpCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            srcY,
            canvas.width,
            srcHeight,
            0,
            0,
            tmpCanvas.width,
            tmpCanvas.height
          );

          const pageImgData = tmpCanvas.toDataURL("image/jpeg", 1.0);
          pdf.addImage(pageImgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        }
      }

      // Generate filename
      const contractName =
        typeof contract?.template === "object"
          ? contract.template.name
          : "Contract";
      const filename = `${contractName.replace(/\s+/g, "-")}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // If loading
  if (isLoading) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  // If error or contract not found
  if (error || !contract) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading contract. It may not exist or you may not have
            permission to view it.
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Container>
      </Layout>
    );
  }

  // Check if user can take actions on this contract
  const isAdmin = user?.role === "ADMIN";
  const canSign = contract.status === "SENT" && !isAdmin;
  const canSend = contract.status === "DRAFT" && isAdmin;
  const canVoid = ["DRAFT", "SENT"].includes(contract.status) && isAdmin;

  // Check if template requires witness
  const requiresWitness =
    typeof contract.template === "object"
      ? contract.template.requires_signature
      : true;

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          {/* Header with action buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToEvent}
            >
              Back to Event
            </Button>

            <Box>
              {canSend && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  onClick={() => setSendDialogOpen(true)}
                  sx={{ mr: 1 }}
                  disabled={isUpdating}
                >
                  Send to Client
                </Button>
              )}

              {canVoid && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<VoidIcon />}
                  onClick={() => setVoidDialogOpen(true)}
                  disabled={isUpdating}
                >
                  Void Contract
                </Button>
              )}
            </Box>
          </Box>

          {/* Contract Details Card */}
          <ContractDetail contract={contract} />

          <Divider sx={{ my: 3 }} />

          {/* Contract Viewer */}
          <ContractViewer
            contract={contract}
            onSign={canSign ? () => setSignDialogOpen(true) : undefined}
            onDownload={handleDownloadPdf}
          />
        </Box>

        {/* Sign Contract Dialog */}
        <Dialog
          open={signDialogOpen}
          onClose={() => setSignDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Sign Contract</DialogTitle>
          <DialogContent>
            <ContractSignatureForm
              onSubmit={handleSignContract}
              isSubmitting={isSigning}
              requireWitness={requiresWitness}
            />
          </DialogContent>
        </Dialog>

        {/* Send Contract Dialog */}
        <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)}>
          <DialogTitle>Send Contract to Client</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to send this contract to the client? The
              client will be notified and will be able to view and sign the
              contract.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendContract}
              variant="contained"
              color="primary"
              disabled={isUpdating}
            >
              {isUpdating ? "Sending..." : "Send Contract"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Void Contract Dialog */}
        <Dialog open={voidDialogOpen} onClose={() => setVoidDialogOpen(false)}>
          <DialogTitle>Void Contract</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to void this contract? This action cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVoidDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleVoidContract}
              variant="contained"
              color="error"
              disabled={isUpdating}
            >
              {isUpdating ? "Voiding..." : "Void Contract"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default ContractDetails;

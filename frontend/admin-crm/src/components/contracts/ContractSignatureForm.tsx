// frontend/admin-crm/src/components/contracts/ContractSignatureForm.tsx
import { Clear as ClearIcon, Save as SaveIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  ContractSignatureData,
  ContractSignatureFormErrors,
} from "../../types/contracts.types";

interface ContractSignatureFormProps {
  onSubmit: (data: ContractSignatureData) => void;
  isSubmitting?: boolean;
  requireWitness?: boolean;
}

const ContractSignatureForm: React.FC<ContractSignatureFormProps> = ({
  onSubmit,
  isSubmitting = false,
  requireWitness = false,
}) => {
  // Refs for signature canvases
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);
  const witnessSigCanvasRef = useRef<SignatureCanvas | null>(null);

  // State for form
  const [witnessName, setWitnessName] = useState("");
  const [errors, setErrors] = useState<ContractSignatureFormErrors>({});

  // Handle clear signature pad
  const handleClearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
    // Clear error when signature is cleared
    if (errors.signature_data) {
      setErrors({
        ...errors,
        signature_data: undefined,
      });
    }
  };

  // Handle clear witness signature pad
  const handleClearWitnessSignature = () => {
    if (witnessSigCanvasRef.current) {
      witnessSigCanvasRef.current.clear();
    }
  };

  // Check if signature pad is empty
  const isSignatureEmpty = (): boolean => {
    return sigCanvasRef.current ? sigCanvasRef.current.isEmpty() : true;
  };

  // Check if witness signature pad is empty
  const isWitnessSignatureEmpty = (): boolean => {
    return witnessSigCanvasRef.current
      ? witnessSigCanvasRef.current.isEmpty()
      : true;
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: ContractSignatureFormErrors = {};
    let isValid = true;

    if (isSignatureEmpty()) {
      newErrors.signature_data = "Signature is required";
      isValid = false;
    }

    if (requireWitness) {
      if (!witnessName.trim()) {
        newErrors.witness_name = "Witness name is required";
        isValid = false;
      }

      if (isWitnessSignatureEmpty()) {
        newErrors.witness_signature = "Witness signature is required";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Get signature data as base64 string
      const signatureData = sigCanvasRef.current?.toDataURL() || "";

      // Get witness signature data if present
      const witnessSignatureData =
        requireWitness && !isWitnessSignatureEmpty()
          ? witnessSigCanvasRef.current?.toDataURL() || ""
          : undefined;

      // Create signature data object
      const data: ContractSignatureData = {
        signature_data: signatureData,
        witness_name: requireWitness ? witnessName : undefined,
        witness_signature: witnessSignatureData,
      };

      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Sign Contract
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please sign in the box below to complete the contract.
          </Typography>
        </Grid>

        {/* Main Signature */}
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.signature_data}>
            <Typography variant="subtitle2" gutterBottom>
              Your Signature:
            </Typography>
            <Box
              sx={{
                border: (theme) =>
                  `1px solid ${
                    errors.signature_data
                      ? theme.palette.error.main
                      : theme.palette.divider
                  }`,
                borderRadius: 1,
                backgroundColor: "#f8f8f8",
                position: "relative",
              }}
            >
              <SignatureCanvas
                ref={sigCanvasRef}
                canvasProps={{
                  width: 600,
                  height: 200,
                  className: "signature-canvas",
                  style: { width: "100%", height: "200px" },
                }}
                backgroundColor="rgba(0,0,0,0)"
                clearOnResize={false}
              />
              <IconButton
                size="small"
                onClick={handleClearSignature}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "rgba(255,255,255,0.8)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
            {errors.signature_data && (
              <FormHelperText>{errors.signature_data}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Witness information (if required) */}
        {requireWitness && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Witness Information
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This contract requires a witness signature.
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Witness Name"
                value={witnessName}
                onChange={(e) => {
                  setWitnessName(e.target.value);
                  // Clear error when field is modified
                  if (errors.witness_name) {
                    setErrors({
                      ...errors,
                      witness_name: undefined,
                    });
                  }
                }}
                fullWidth
                required
                error={!!errors.witness_name}
                helperText={errors.witness_name}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.witness_signature}>
                <Typography variant="subtitle2" gutterBottom>
                  Witness Signature:
                </Typography>
                <Box
                  sx={{
                    border: (theme) =>
                      `1px solid ${
                        errors.witness_signature
                          ? theme.palette.error.main
                          : theme.palette.divider
                      }`,
                    borderRadius: 1,
                    backgroundColor: "#f8f8f8",
                    position: "relative",
                  }}
                >
                  <SignatureCanvas
                    ref={witnessSigCanvasRef}
                    canvasProps={{
                      width: 600,
                      height: 150,
                      className: "witness-signature-canvas",
                      style: { width: "100%", height: "150px" },
                    }}
                    backgroundColor="rgba(0,0,0,0)"
                    clearOnResize={false}
                  />
                  <IconButton
                    size="small"
                    onClick={handleClearWitnessSignature}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "rgba(255,255,255,0.8)",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Box>
                {errors.witness_signature && (
                  <FormHelperText>{errors.witness_signature}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </>
        )}

        {/* Submit Button */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={isSubmitting}
              sx={{ minWidth: 120 }}
            >
              {isSubmitting ? "Signing..." : "Sign Contract"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ContractSignatureForm;

// frontend/admin-crm/src/components/contracts/ContractViewer.tsx
import {
  Download as DownloadIcon,
  DrawOutlined as SignatureIcon,
} from "@mui/icons-material";
import { Box, Button, Divider, Paper, Typography, styled } from "@mui/material";
import { format } from "date-fns";
import React from "react";
import ReactMarkdown from "react-markdown";
import { EventContract } from "../../types/contracts.types";

const ContractSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const SignatureBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const SignatureImage = styled("img")({
  maxWidth: 300,
  maxHeight: 100,
  marginBottom: 8,
});

interface ContractViewerProps {
  contract: EventContract;
  onSign?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

const ContractViewer: React.FC<ContractViewerProps> = ({
  contract,
  onSign,
  onPrint,
  onDownload,
}) => {
  // Handle printing the contract
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  // Decide whether to show sign button
  const showSignButton = onSign && contract.status === "SENT";

  return (
    <Box sx={{ mb: 4 }}>
      {/* Actions */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        {showSignButton && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<SignatureIcon />}
            onClick={onSign}
          >
            Sign Contract
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={onDownload || handlePrint}
        >
          {onDownload ? "Download" : "Print"} Contract
        </Button>
      </Box>

      {/* Contract Content */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: 4, bgcolor: "#fcfcfc" }}
        id="printable-contract"
      >
        {/* Contract Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {typeof contract.template === "object"
              ? contract.template.name
              : contract.template_name || "Agreement"}
          </Typography>

          {contract.valid_until && (
            <Typography variant="subtitle1" color="text.secondary">
              Valid until:{" "}
              {format(new Date(contract.valid_until), "MMMM d, yyyy")}
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Contract Body - Parse markdown if content contains markdown */}
        <Box sx={{ mb: 6 }}>
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  {...(props as any)}
                />
              ),
              h2: ({ node, ...props }) => (
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  {...(props as any)}
                />
              ),
              h3: ({ node, ...props }) => (
                <Typography
                  variant="subtitle1"
                  component="h4"
                  fontWeight="bold"
                  gutterBottom
                  {...(props as any)}
                />
              ),
              p: ({ node, ...props }) => (
                <Typography variant="body1" paragraph {...(props as any)} />
              ),
              ul: ({ node, ...props }) => (
                <Box component="ul" sx={{ pl: 4 }} {...(props as any)} />
              ),
              ol: ({ node, ...props }) => (
                <Box component="ol" sx={{ pl: 4 }} {...(props as any)} />
              ),
              li: ({ node, ...props }) => (
                <Box component="li" sx={{ mb: 1 }} {...(props as any)} />
              ),
              hr: ({ node, ...props }) => (
                <Divider sx={{ my: 2 }} {...(props as any)} />
              ),
            }}
          >
            {contract.content}
          </ReactMarkdown>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Signature Section */}
        <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Signatures
          </Typography>

          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {/* Client Signature */}
            <SignatureBox sx={{ flex: 1, minWidth: 250 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Client Signature
              </Typography>

              {contract.signature_data ? (
                <>
                  <SignatureImage
                    src={contract.signature_data}
                    alt="Client Signature"
                  />
                  <Typography variant="body2">
                    Signed by:{" "}
                    {contract.signed_by
                      ? typeof contract.signed_by === "object"
                        ? `${contract.signed_by.first_name} ${contract.signed_by.last_name}`
                        : "Client"
                      : "Client"}
                  </Typography>
                  {contract.signed_at && (
                    <Typography variant="caption" color="text.secondary">
                      {format(
                        new Date(contract.signed_at),
                        "MMMM d, yyyy 'at' h:mm a"
                      )}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  {contract.status === "SENT"
                    ? "Awaiting signature"
                    : "Not yet signed"}
                </Typography>
              )}
            </SignatureBox>

            {/* Witness Signature (if present) */}
            {(contract.witness_name || contract.witness_signature) && (
              <SignatureBox sx={{ flex: 1, minWidth: 250 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Witness Signature
                </Typography>

                {contract.witness_signature ? (
                  <>
                    <SignatureImage
                      src={contract.witness_signature}
                      alt="Witness Signature"
                    />
                    {contract.witness_name && (
                      <Typography variant="body2">
                        Witness: {contract.witness_name}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    No witness signature
                  </Typography>
                )}
              </SignatureBox>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ContractViewer;

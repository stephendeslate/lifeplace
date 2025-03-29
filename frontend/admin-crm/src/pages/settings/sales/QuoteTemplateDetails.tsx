// frontend/admin-crm/src/pages/settings/sales/QuoteTemplateDetails.tsx
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  ShoppingCart as ProductIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddContractTemplateDialog from "../../../components/sales/AddContractTemplateDialog";
import AddProductDialog from "../../../components/sales/AddProductDialog";
import AddQuestionnaireDialog from "../../../components/sales/AddQuestionnaireDialog";
import QuoteTemplateForm from "../../../components/sales/QuoteTemplateForm";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { useContractTemplates } from "../../../hooks/useContracts";
import { useProducts } from "../../../hooks/useProducts";
import { useQuestionnaires } from "../../../hooks/useQuestionnaires";
import { useQuoteTemplate } from "../../../hooks/useSales";
import { QuoteTemplateProductFormData } from "../../../types/sales.types";
import { formatCurrency } from "../../../utils/formatters";

const QuoteTemplateDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = window.location.pathname.includes("/edit");
  const isNewTemplate = id === "new";

  const [currentTab, setCurrentTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // States for add/edit dialogs
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editProductData, setEditProductData] =
    useState<Partial<QuoteTemplateProductFormData> | null>(null);
  const [contractTemplateDialogOpen, setContractTemplateDialogOpen] =
    useState(false);
  const [questionnaireDialogOpen, setQuestionnaireDialogOpen] = useState(false);

  // Use custom hooks for data
  const {
    template,
    isLoading,
    error,
    addProduct,
    isAddingProduct,
    updateProduct,
    isUpdatingProduct,
    removeProduct,
    isRemovingProduct,
    updateContractTemplates,
    isUpdatingContractTemplates,
    updateQuestionnaires,
    isUpdatingQuestionnaires,
  } = useQuoteTemplate(isNewTemplate ? undefined : Number(id));

  // Get products for selection
  const { products, isLoading: isLoadingProducts } = useProducts();

  // Get contract templates for selection
  const {
    templates: contractTemplates,
    isLoading: isLoadingContractTemplates,
  } = useContractTemplates();

  // Get questionnaires for selection
  const { questionnaires, isLoading: isLoadingQuestionnaires } =
    useQuestionnaires();

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Update template contract templates
  const handleUpdateContractTemplates = async (
    selectedTemplateIds: number[]
  ) => {
    if (!template) return;

    updateContractTemplates({
      contractTemplateIds: selectedTemplateIds,
    });

    setContractTemplateDialogOpen(false);
  };

  // Update template questionnaires
  const handleUpdateQuestionnaires = async (
    selectedQuestionnaireIds: number[]
  ) => {
    if (!template) return;

    updateQuestionnaires({
      questionnaireIds: selectedQuestionnaireIds,
    });

    setQuestionnaireDialogOpen(false);
  };

  // Handle add/edit product
  const handleSaveProduct = (productData: QuoteTemplateProductFormData) => {
    if (editProductData && editProductData.id) {
      // Update existing product
      updateProduct({
        productId: editProductData.id as number,
        productData: {
          quantity: productData.quantity,
          is_required: productData.is_required,
        },
      });
    } else {
      // Add new product
      addProduct({
        ...productData,
        template: Number(id),
      });
    }
    setProductDialogOpen(false);
    setEditProductData(null);
  };

  // Handle edit product click
  const handleEditProduct = (productData: any) => {
    setEditProductData({
      id: productData.id,
      product: productData.product,
      quantity: productData.quantity,
      is_required: productData.is_required,
    });
    setProductDialogOpen(true);
  };

  // Handle delete product
  const handleDeleteProduct = () => {
    if (productToDelete) {
      removeProduct(productToDelete);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // If we're in edit mode but the template doesn't exist, redirect
  useEffect(() => {
    if (!isLoading && error && !isNewTemplate) {
      navigate("/settings/sales/quote-templates");
    }
  }, [isLoading, error, isNewTemplate, navigate]);

  if (isEditMode || isNewTemplate) {
    return (
      <SettingsLayout
        title={isNewTemplate ? "Create Quote Template" : "Edit Quote Template"}
        description={
          isNewTemplate
            ? "Create a new template for generating quotes"
            : "Edit an existing quote template"
        }
      >
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              navigate(
                isNewTemplate
                  ? "/settings/sales/quote-templates"
                  : `/settings/sales/quote-templates/${id}`
              );
            }}
          >
            {isNewTemplate ? "Back to Templates" : "Back to Template Details"}
          </Button>
        </Box>

        {isLoading && !isNewTemplate ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <QuoteTemplateForm
            initialValues={isNewTemplate ? undefined : template}
            isNewTemplate={isNewTemplate}
          />
        )}
      </SettingsLayout>
    );
  }

  // View mode
  return (
    <SettingsLayout
      title={template?.name || "Quote Template Details"}
      description="View and manage template details and products"
    >
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Error loading template: {error.message}</Alert>
      ) : template ? (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 3,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/settings/sales/quote-templates")}
            >
              Back to Templates
            </Button>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() =>
                  navigate(`/settings/sales/quote-templates/${id}/edit`)
                }
              >
                Edit Template
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: "background.paper",
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                mb: 2,
              }}
            >
              <Typography variant="h5">{template.name}</Typography>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                {template.event_type_name && (
                  <Chip
                    label={`Event Type: ${template.event_type_name}`}
                    color="primary"
                    variant="outlined"
                  />
                )}
                <Chip
                  label={template.is_active ? "Active" : "Inactive"}
                  color={template.is_active ? "success" : "default"}
                />
              </Box>
            </Box>

            {template.introduction && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Introduction
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-wrap", mb: 2 }}
                >
                  {template.introduction}
                </Typography>
              </>
            )}

            {template.terms_and_conditions && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Terms and Conditions
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {template.terms_and_conditions}
                </Typography>
              </>
            )}
          </Box>

          <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Products" />
            <Tab label="Contract Templates" />
            <Tab label="Questionnaires" />
          </Tabs>

          {currentTab === 0 && (
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Products</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={() => {
                      setEditProductData(null);
                      setProductDialogOpen(true);
                    }}
                  >
                    Add Product
                  </Button>
                </Box>

                {template.products?.length ? (
                  <List>
                    {template.products.map((productRel) => (
                      <React.Fragment key={productRel.id}>
                        <ListItem>
                          <ListItemIcon>
                            <ProductIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              productRel.product_details?.name || "Product"
                            }
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {formatCurrency(
                                    productRel.product_details?.base_price || 0
                                  )}
                                </Typography>
                                {" · "}
                                Quantity: {productRel.quantity}
                                {productRel.is_required && " · Required"}
                              </>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Tooltip title="Edit">
                              <IconButton
                                edge="end"
                                onClick={() => handleEditProduct(productRel)}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove">
                              <IconButton
                                edge="end"
                                color="error"
                                onClick={() => {
                                  setProductToDelete(productRel.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No products added to this template yet. Click "Add Product"
                    to add products that will be automatically included in
                    quotes created from this template.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {currentTab === 1 && (
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Contract Templates</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={() => setContractTemplateDialogOpen(true)}
                  >
                    Add Contract Template
                  </Button>
                </Box>

                {template.contract_templates?.length ? (
                  <List>
                    {template.contract_templates.map((contract) => (
                      <React.Fragment key={contract.id}>
                        <ListItem>
                          <ListItemIcon>
                            <DescriptionIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={contract.name}
                            secondary={contract.description}
                          />
                          <ListItemSecondaryAction>
                            <Tooltip title="Remove">
                              <IconButton
                                edge="end"
                                color="error"
                                // In a complete implementation, you would call a function to remove the contract template
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No contract templates linked to this quote template. Link
                    contract templates to automatically generate contracts when
                    quotes created from this template are accepted.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {currentTab === 2 && (
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Questionnaires</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={() => setQuestionnaireDialogOpen(true)}
                  >
                    Add Questionnaire
                  </Button>
                </Box>

                {template.questionnaires?.length ? (
                  <List>
                    {template.questionnaires.map((questionnaire) => (
                      <React.Fragment key={questionnaire.id}>
                        <ListItem>
                          <ListItemIcon>
                            <DescriptionIcon />
                          </ListItemIcon>
                          <ListItemText primary={questionnaire.name} />
                          <ListItemSecondaryAction>
                            <Tooltip title="Remove">
                              <IconButton
                                edge="end"
                                color="error"
                                // In a complete implementation, you would call a function to remove the questionnaire
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No questionnaires linked to this quote template. Link
                    questionnaires to automatically gather client information
                    when quotes created from this template are accepted.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

      {/* Delete product confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Remove Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this product from the template? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteProduct}
            color="error"
            variant="contained"
            disabled={isRemovingProduct}
            startIcon={isRemovingProduct && <CircularProgress size={16} />}
          >
            {isRemovingProduct ? "Removing..." : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Product Dialog */}
      <AddProductDialog
        open={productDialogOpen}
        onClose={() => {
          setProductDialogOpen(false);
          setEditProductData(null);
        }}
        onSave={handleSaveProduct}
        products={products}
        isSubmitting={isAddingProduct || isUpdatingProduct}
        templateId={Number(id)}
        initialValues={editProductData || undefined}
        editMode={!!editProductData}
      />

      {/* Add Contract Templates Dialog */}
      <AddContractTemplateDialog
        open={contractTemplateDialogOpen}
        onClose={() => setContractTemplateDialogOpen(false)}
        onSave={handleUpdateContractTemplates}
        availableTemplates={contractTemplates || []}
        currentTemplateIds={
          template?.contract_templates?.map((t) => t.id) || []
        }
        isSubmitting={isUpdatingContractTemplates}
      />

      {/* Add Questionnaires Dialog */}
      <AddQuestionnaireDialog
        open={questionnaireDialogOpen}
        onClose={() => setQuestionnaireDialogOpen(false)}
        onSave={handleUpdateQuestionnaires}
        availableQuestionnaires={questionnaires || []}
        currentQuestionnaireIds={
          template?.questionnaires?.map((q) => q.id) || []
        }
        isSubmitting={isUpdatingQuestionnaires}
      />
    </SettingsLayout>
  );
};

export default QuoteTemplateDetails;

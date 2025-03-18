// frontend/admin-crm/src/components/common/Layout.tsx
import { Box, CssBaseline } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

// Styled components
const LayoutRoot = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  overflow: "hidden",
  width: "100%",
}));

const LayoutWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 1 auto",
  overflow: "hidden",
  paddingTop: 64, // Header height
  [theme.breakpoints.up("lg")]: {
    paddingLeft: 280, // Sidebar width
  },
}));

const LayoutContainer = styled("div")({
  display: "flex",
  flex: "1 1 auto",
  overflow: "hidden",
});

const LayoutContent = styled("div")({
  flex: "1 1 auto",
  height: "100%",
  overflow: "auto",
  position: "relative",
});

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <LayoutRoot>
      <CssBaseline />
      <Header onMobileNavOpen={() => setMobileNavOpen(true)} />
      <Sidebar
        onMobileClose={() => setMobileNavOpen(false)}
        openMobile={isMobileNavOpen}
      />
      <LayoutWrapper>
        <LayoutContainer>
          <LayoutContent>
            <Box sx={{ p: 3, minHeight: "calc(100vh - 64px)" }}>{children}</Box>
          </LayoutContent>
        </LayoutContainer>
      </LayoutWrapper>
    </LayoutRoot>
  );
};

export default Layout;

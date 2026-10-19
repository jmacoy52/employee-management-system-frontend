import React from "react";
import Header from "./Header";
import Footer from "./Footer";

// Header + page content + Footer, with the footer pinned to the bottom.
const PageLayout = ({ children, footer = "full" }) => (
  <div className="page-layout">
    <Header />
    <main className="page-main">{children}</main>
    <Footer variant={footer} />
  </div>
);

export default PageLayout;

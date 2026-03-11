/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

"use client"

import type React from "react"
import { useState } from "react"
import styles from "./indexHomeComponent.module.css"
import { Button } from "rsuite";
import { IndexHomeComponentProps } from "../../models/indexHomeComponent/indexHomeComponent";
import HeroBanner from "../../../../../../../public/landing.png";
import Image from "next/image";
import Logo from "../../../../../../../public/logo.svg";

export function IndexHomeComponent({ brandingPreference, signinOnClick, signUpOnClick }: IndexHomeComponentProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className={styles.landingPage}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.container}>
                    <div className={styles.headerContent}>
                        <div className={styles.logo}>
                            { brandingPreference?.logoUrl ?
                                <img src={brandingPreference?.logoUrl} height={35} alt="logo" />
                                : <Image src={Logo} height={35} alt="logo" />
                            }
                        </div>

                        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ""}`}>
                            <a href="#features" className={styles.navLink}>
                                Features
                            </a>
                            <a href="#testimonials" className={styles.navLink}>
                                Testimonials
                            </a>
                            <a href="#pricing" className={styles.navLink}>
                                Pricing
                            </a>
                            <a href="#contact" className={styles.navLink}>
                                Contact
                            </a>
                        </nav>

                        <div className={styles.headerActions}>
                            <Button
                                className={styles.signUpButton}
                                size="lg"
                                appearance="link"
                                onClick={signUpOnClick}
                            >
                                Get Started
                            </Button>
                            <Button
                                className={styles.signInButton}
                                size="lg"
                                appearance="primary"
                                onClick={signinOnClick}
                            >
                                Sign In
                            </Button>
                        </div>

                        <button className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? "✕" : "☰"}
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.container}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroText}>
                            <div className={styles.heroBadge}>🚀 New: AI-powered insights now available</div>

                            <h1 className={styles.heroTitle}>
                                Where teams <span className={styles.highlight}>collaborate</span> and ideas come to life
                            </h1>

                            <p className={styles.heroDescription}>
                                Streamline your team's workflow with our all-in-one collaboration platform. Chat, plan, share, and
                                deliver exceptional results together.
                            </p>

                            <div className={styles.heroActions}>
                                <Button
                                    className={styles.signUpButton}
                                    size="lg"
                                    appearance="primary"
                                    onClick={signUpOnClick}
                                    
                                >
                                    Start Free Trial →
                                </Button>
                                <Button className={`${styles.btnSecondary} ${styles.btnLarge}`}  >▶ Watch Demo</Button>
                            </div>

                            <div className={styles.heroFeatures}>
                                <div className={styles.featureItem}>
                                    <span className={styles.checkmark}>✓</span>
                                    Free 14-day trial
                                </div>
                                <div className={styles.featureItem}>
                                    <span className={styles.checkmark}>✓</span>
                                    No credit card required
                                </div>
                            </div>
                        </div>

                        <div className={styles.heroImage}>
                            <div className={styles.statusBadge}>
                                <div className={styles.statusDot}></div>
                                <span>12 team members online</span>
                            </div>
                        </div>
                        <div className={styles.heroBanner}>
                            <Image alt="hero banner" src={HeroBanner} height={500} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default IndexHomeComponent;

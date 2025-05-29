// my-app/src/components/Header/Header.js - Dodavanje Admin linka
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
    Navbar,
    NavbarBrand,
    NavbarToggler,
    Collapse,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Button
} from 'reactstrap';

export default function Header() {
    const { user, logout, isAuthor, isAdmin } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <Navbar color="dark" dark expand="md">
            <div className="container">
                <NavbarBrand tag={Link} href="/">
                    Blog Platform
                </NavbarBrand>
                <NavbarToggler onClick={toggle} />
                <Collapse isOpen={isOpen} navbar timeout={500}>
                    <Nav className="me-auto" navbar>
                        <NavItem>
                            <NavLink tag={Link} href="/posts">
                                Postovi
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink tag={Link} href="/categories">
                                Kategorije
                            </NavLink>
                        </NavItem>
                        {/* Dodajte Admin link */}
                        {user && isAdmin() && (
                            <NavItem>
                                <NavLink tag={Link} href="/admin">
                                    Admin Panel
                                </NavLink>
                            </NavItem>
                        )}
                    </Nav>

                    <Nav navbar>
                        {user ? (
                            <>
                                {isAuthor() && (
                                    <NavItem>
                                        <NavLink tag={Link} href="/posts/create">
                                            Novi Post
                                        </NavLink>
                                    </NavItem>
                                )}
                                <UncontrolledDropdown nav inNavbar>
                                    <DropdownToggle nav caret>
                                        {user.firstName} {user.lastName}
                                        {/* Dodajte Admin badge */}
                                        {isAdmin() && (
                                            <span className="badge bg-danger ms-1" style={{fontSize: '10px'}}>
                                                ADMIN
                                            </span>
                                        )}
                                    </DropdownToggle>
                                    <DropdownMenu end>
                                        {isAuthor() && (
                                            <DropdownItem tag={Link} href="/posts/my-posts">
                                                Moji Postovi
                                            </DropdownItem>
                                        )}
                                        <DropdownItem tag={Link} href="/profile">
                                            Profil
                                        </DropdownItem>
                                        {/* Admin dropdown stavka */}
                                        {isAdmin() && (
                                            <>
                                                <DropdownItem divider />
                                                <DropdownItem tag={Link} href="/admin">
                                                    Admin Panel
                                                </DropdownItem>
                                            </>
                                        )}
                                        <DropdownItem divider />
                                        <DropdownItem onClick={logout}>
                                            Odjavi se
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            </>
                        ) : (
                            <>
                                <NavItem>
                                    <NavLink tag={Link} href="/auth/signin">
                                        Prijavi se
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <Button
                                        color="primary"
                                        size="sm"
                                        tag={Link}
                                        href="/auth/signup"
                                        className="ms-2"
                                    >
                                        Registruj se
                                    </Button>
                                </NavItem>
                            </>
                        )}
                    </Nav>
                </Collapse>
            </div>
        </Navbar>
    );
}
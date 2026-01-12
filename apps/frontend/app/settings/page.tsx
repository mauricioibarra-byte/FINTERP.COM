"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building, Lock, User, Shield, Check, Globe } from "lucide-react"
import { useLanguageStore } from "@/lib/i18n"

export default function SettingsPage() {
    const [roles, setRoles] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const { t } = useLanguageStore()

    useEffect(() => {
        // Fetch real data
        const fetchData = async () => {
            try {
                const [rolesData, usersData] = await Promise.all([
                    api.get('/iam/roles'),
                    api.get('/iam/users')
                ]);
                setRoles(rolesData);
                setUsers(usersData);
            } catch (e) {
                console.error("Failed to fetch IAM data", e);
            }
        }
        fetchData();
    }, [])

    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white p-8 pt-20">
            <div className="max-w-4xl mx-auto w-full space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
                    <p className="text-zinc-400">{t('settings.desc')}</p>
                </div>

                <Tabs defaultValue="users" className="space-y-6">
                    <TabsList className="bg-zinc-900 border border-zinc-800">
                        <TabsTrigger value="company" className="data-[state=active]:bg-zinc-800">
                            <Building className="mr-2 h-4 w-4" /> Company Profile
                        </TabsTrigger>
                        <TabsTrigger value="users" className="data-[state=active]:bg-zinc-800">
                            <User className="mr-2 h-4 w-4" /> Users
                        </TabsTrigger>
                        <TabsTrigger value="roles" className="data-[state=active]:bg-zinc-800">
                            <Shield className="mr-2 h-4 w-4" /> Roles & Permissions
                        </TabsTrigger>
                        <TabsTrigger value="sii" className="data-[state=active]:bg-zinc-800">
                            <Globe className="mr-2 h-4 w-4" /> Tax Compliance
                        </TabsTrigger>

                    </TabsList>

                    {/* Company Profile (Static for now) */}
                    <TabsContent value="company">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-zinc-200">Organization Details</CardTitle>
                                <CardDescription className="text-zinc-500">
                                    These details will appear on your Invoices and Reports.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Company Name</Label>
                                        <Input className="bg-zinc-950 border-zinc-700 text-zinc-200" defaultValue="Acme Corp International" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Tax ID</Label>
                                        <Input className="bg-zinc-950 border-zinc-700 text-zinc-200" defaultValue="77.100.200-K" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Address</Label>
                                    <Input className="bg-zinc-950 border-zinc-700 text-zinc-200" defaultValue="123 Innovation Dr, Tech City" />
                                </div>
                                <div className="pt-2">
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-zinc-200">Team Members</CardTitle>
                                <CardDescription className="text-zinc-500">Manage access to FintERP.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {users.length === 0 && <div className="text-zinc-500">No users found (other than you).</div>}
                                    {users.map(u => (
                                        <div key={u.id} className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                                                    {u.fullName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-200">{u.fullName}</p>
                                                    <p className="text-sm text-zinc-500">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                                    {u.role?.name || 'No Role'}
                                                </Badge>
                                                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">Edit</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="roles">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-zinc-200">Roles & Permissions</CardTitle>
                                    <CardDescription className="text-zinc-500">Define what users can do.</CardDescription>
                                </div>
                                <Button size="sm" className="bg-zinc-100 text-zinc-900">Create Role</Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {roles.length === 0 && <div className="text-zinc-500">No roles defined.</div>}
                                    {roles.map(role => (
                                        <div key={role.id} className="p-4 border border-zinc-800 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-zinc-200">{role.name}</h3>
                                                    <p className="text-sm text-zinc-500">{role.description || 'No description'}</p>
                                                </div>
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {role.permisions.map((p: string) => (
                                                    <Badge key={p} variant="secondary" className="bg-zinc-800 text-zinc-400 text-xs">
                                                        {p}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sii">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-zinc-200">SII Tax Compliance</CardTitle>
                                <CardDescription className="text-zinc-500">Manage Digital Certificates and DTE authorization (CAF).</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                                    <h3 className="text-lg font-medium text-zinc-200 mb-2">Digital Certificate (.pfx)</h3>
                                    <p className="text-zinc-400 text-sm mb-4">Required to sign DTEs. Securely stored.</p>
                                    <div className="flex items-center gap-4">
                                        <Button variant="outline"><Lock className="mr-2 h-4 w-4" /> Upload Certificate</Button>
                                        <span className="text-zinc-500 text-sm">No certificate uploaded.</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                                    <h3 className="text-lg font-medium text-zinc-200 mb-2">Folio Authorization (CAF)</h3>
                                    <p className="text-zinc-400 text-sm mb-4">Upload XML files from SII to authorize invoice ranges.</p>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-zinc-950 p-3 rounded border border-zinc-800">
                                            <div>
                                                <p className="font-medium text-zinc-300">Factura Electrónica (33)</p>
                                                <p className="text-xs text-zinc-500">Range: 1 - 500 • Active</p>
                                            </div>
                                            <Badge variant="outline" className="border-emerald-800 text-emerald-400">Active</Badge>
                                        </div>
                                        <Button size="sm" className="w-full bg-zinc-800 hover:bg-zinc-700">Upload New CAF</Button>
                                    </div>
                                </div>

                                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                                    <h3 className="text-lg font-medium text-zinc-200 mb-2">Connection Status</h3>
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        <span className="text-zinc-300">Connected to SII (Maullin - Certification)</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* COA Tab Removed */}
                </Tabs>
            </div>
        </div>
    )
}

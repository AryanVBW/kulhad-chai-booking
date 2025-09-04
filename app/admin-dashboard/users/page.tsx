"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Users, Plus, Edit, Trash2, Shield, Activity } from "lucide-react"
import { getUsers, addUser, updateUser, deleteUser, getUserActivity } from "@/lib/business-store"
import type { User, UserActivity } from "@/lib/business-types"

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "staff" as "admin" | "manager" | "staff",
    password: "",
    permissions: {
      customers: { read: true, write: false, delete: false },
      products: { read: true, write: false, delete: false },
      invoices: { read: true, write: false, delete: false },
      payments: { read: true, write: false, delete: false },
      reports: { read: false, write: false, delete: false },
      users: { read: false, write: false, delete: false },
    },
  })

  useEffect(() => {
    setUsers(getUsers())
    setUserActivity(getUserActivity())
  }, [])

  const handleAddUser = () => {
    const user = addUser(newUser)
    setUsers(getUsers())
    setIsAddDialogOpen(false)
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "staff",
      password: "",
      permissions: {
        customers: { read: true, write: false, delete: false },
        products: { read: true, write: false, delete: false },
        invoices: { read: true, write: false, delete: false },
        payments: { read: true, write: false, delete: false },
        reports: { read: false, write: false, delete: false },
        users: { read: false, write: false, delete: false },
      },
    })
  }

  const handleUpdateUser = () => {
    if (editingUser) {
      updateUser(editingUser.id, editingUser)
      setUsers(getUsers())
      setEditingUser(null)
    }
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId)
      setUsers(getUsers())
    }
  }

  const toggleUserStatus = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      updateUser(userId, { ...user, isActive: !user.isActive })
      setUsers(getUsers())
    }
  }

  const updatePermission = (module: string, permission: string, value: boolean) => {
    if (editingUser) {
      setEditingUser({
        ...editingUser,
        permissions: {
          ...editingUser.permissions,
          [module]: {
            ...editingUser.permissions[module as keyof typeof editingUser.permissions],
            [permission]: value,
          },
        },
      })
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar - Same as other pages */}
        <div className="w-64 bg-sidebar text-sidebar-foreground min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold">Business Admin</h1>
            <p className="text-sm text-sidebar-foreground/70">User Management</p>
          </div>
          <nav className="px-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard")}
            >
              <Activity className="mr-3 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/customers")}
            >
              <Users className="mr-3 h-4 w-4" />
              Customers
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/products")}
            >
              <Users className="mr-3 h-4 w-4" />
              Products
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/invoices")}
            >
              <Users className="mr-3 h-4 w-4" />
              Invoices
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/payments")}
            >
              <Users className="mr-3 h-4 w-4" />
              Payments
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/reports")}
            >
              <Users className="mr-3 h-4 w-4" />
              Reports
            </Button>
            <Button variant="default" className="w-full justify-start">
              <Shield className="mr-3 h-4 w-4" />
              User Management
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground">Manage users, roles, and permissions</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: "admin" | "manager" | "staff") => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser}>Add User</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : user.role === "manager" ? "secondary" : "outline"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={user.isActive} onCheckedChange={() => toggleUserStatus(user.id)} />
                          <span className="text-sm">{user.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Edit User Permissions</DialogTitle>
                              </DialogHeader>
                              {editingUser && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Name</Label>
                                      <Input
                                        value={editingUser.name}
                                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <Label>Role</Label>
                                      <Select
                                        value={editingUser.role}
                                        onValueChange={(value: "admin" | "manager" | "staff") =>
                                          setEditingUser({ ...editingUser, role: value })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="admin">Admin</SelectItem>
                                          <SelectItem value="manager">Manager</SelectItem>
                                          <SelectItem value="staff">Staff</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="text-lg font-semibold mb-4">Permissions</h3>
                                    <div className="space-y-4">
                                      {Object.entries(editingUser.permissions).map(([module, perms]) => (
                                        <Card key={module}>
                                          <CardHeader>
                                            <CardTitle className="text-base capitalize">{module}</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="flex gap-6">
                                              <div className="flex items-center gap-2">
                                                <Switch
                                                  checked={perms.read}
                                                  onCheckedChange={(checked) =>
                                                    updatePermission(module, "read", checked)
                                                  }
                                                />
                                                <Label>Read</Label>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Switch
                                                  checked={perms.write}
                                                  onCheckedChange={(checked) =>
                                                    updatePermission(module, "write", checked)
                                                  }
                                                />
                                                <Label>Write</Label>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Switch
                                                  checked={perms.delete}
                                                  onCheckedChange={(checked) =>
                                                    updatePermission(module, "delete", checked)
                                                  }
                                                />
                                                <Label>Delete</Label>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setEditingUser(null)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleUpdateUser}>Save Changes</Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* User Activity Log */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivity.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{activity.userName}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{new Date(activity.timestamp).toLocaleString()}</p>
                      <Badge variant="outline">{activity.module}</Badge>
                    </div>
                  </div>
                ))}
                {userActivity.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No user activity recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../lib/auth'

type Department = { id: string; name: string; description: string | null; isActive?: boolean; archivedAt?: string | null; _count?: { devices: number } }
type Device = {
  id: string
  name: string
  model: string
  description: string | null
  departmentId: string | null
  knowledgeComplete: boolean
  knowledgeScore?: number | null
  isActive?: boolean
  archivedAt?: string | null
}
type DeviceModel = { id: string; deviceId: string; modelName: string; year: number | null; specifications: string | null; isActive?: boolean; archivedAt?: string | null }

export default function TaxonomyAdminPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [models, setModels] = useState<DeviceModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [deptName, setDeptName] = useState('')
  const [deptDescription, setDeptDescription] = useState('')
  const [deviceName, setDeviceName] = useState('')
  const [deviceModel, setDeviceModel] = useState('')
  const [deviceDescription, setDeviceDescription] = useState('')
  const [deviceDepartmentId, setDeviceDepartmentId] = useState('')
  const [deviceKnowledgeComplete, setDeviceKnowledgeComplete] = useState(false)
  const [deviceKnowledgeScore, setDeviceKnowledgeScore] = useState('')
  const [modelDeviceId, setModelDeviceId] = useState('')
  const [modelName, setModelName] = useState('')
  const [modelYear, setModelYear] = useState('')
  const [modelSpecs, setModelSpecs] = useState('')
  const [busy, setBusy] = useState(false)
  const [stateFilter, setStateFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null)
  const [editingDeptName, setEditingDeptName] = useState('')
  const [editingDeptDescription, setEditingDeptDescription] = useState('')
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null)
  const [editingDeviceName, setEditingDeviceName] = useState('')
  const [editingDeviceModel, setEditingDeviceModel] = useState('')
  const [editingDeviceDescription, setEditingDeviceDescription] = useState('')
  const [editingDeviceDepartmentId, setEditingDeviceDepartmentId] = useState('')
  const [editingDeviceKnowledgeComplete, setEditingDeviceKnowledgeComplete] = useState(false)
  const [editingDeviceKnowledgeScore, setEditingDeviceKnowledgeScore] = useState('')
  const [editingModelId, setEditingModelId] = useState<string | null>(null)
  const [editingModelName, setEditingModelName] = useState('')
  const [editingModelYear, setEditingModelYear] = useState('')
  const [editingModelSpecs, setEditingModelSpecs] = useState('')

  const departmentMap = useMemo(() => new Map(departments.map((d) => [d.id, d.name])), [departments])
  const deviceMap = useMemo(() => new Map(devices.map((d) => [d.id, d.name])), [devices])

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [d1, d2, d3] = await Promise.all([
        fetch(`/api/admin/taxonomy/departments?state=${stateFilter}`).then((r) => r.json()),
        fetch(`/api/admin/taxonomy/devices?state=${stateFilter}`).then((r) => r.json()),
        fetch(`/api/admin/taxonomy/models?state=${stateFilter}`).then((r) => r.json()),
      ])
      setDepartments(d1.items || [])
      setDevices(d2.items || [])
      setModels(d3.items || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load taxonomy data')
    } finally {
      setLoading(false)
    }
  }, [stateFilter])

  useEffect(() => {
    loadAll().catch(() => null)
  }, [loadAll])

  async function createDepartment(e: FormEvent) {
    e.preventDefault()
    if (!deptName.trim()) return
    setBusy(true)
    setError(null)
    try {
      const r = await fetch('/api/admin/taxonomy/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: deptName.trim(), description: deptDescription.trim() || undefined }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Create failed')
      setDeptName('')
      setDeptDescription('')
      await loadAll()
    } catch (err: any) {
      setError(err?.message || 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  async function createDevice(e: FormEvent) {
    e.preventDefault()
    if (!deviceName.trim() || !deviceModel.trim() || !deviceDepartmentId) return
    setBusy(true)
    setError(null)
    try {
      const r = await fetch('/api/admin/taxonomy/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deviceName.trim(),
          model: deviceModel.trim(),
          description: deviceDescription.trim() || undefined,
          departmentId: deviceDepartmentId,
          knowledgeComplete: deviceKnowledgeComplete,
          knowledgeScore: deviceKnowledgeScore.trim() ? Number(deviceKnowledgeScore) : undefined,
        }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Create failed')
      setDeviceName('')
      setDeviceModel('')
      setDeviceDescription('')
      setDeviceDepartmentId('')
      setDeviceKnowledgeComplete(false)
      setDeviceKnowledgeScore('')
      await loadAll()
    } catch (err: any) {
      setError(err?.message || 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  async function createModel(e: FormEvent) {
    e.preventDefault()
    if (!modelDeviceId || !modelName.trim()) return
    setBusy(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        deviceId: modelDeviceId,
        modelName: modelName.trim(),
      }
      if (modelYear.trim()) payload.year = Number(modelYear)
      if (modelSpecs.trim()) payload.specifications = modelSpecs.trim()

      const r = await fetch('/api/admin/taxonomy/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Create failed')
      setModelDeviceId('')
      setModelName('')
      setModelYear('')
      setModelSpecs('')
      await loadAll()
    } catch (err: any) {
      setError(err?.message || 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  async function setDepartmentActive(id: string, isActive: boolean) {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`/api/admin/taxonomy/departments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Update failed')
      await loadAll()
    } catch (err: any) {
      setError(err?.message || 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  async function setDeviceActive(id: string, isActive: boolean) {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`/api/admin/taxonomy/devices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Update failed')
      await loadAll()
    } catch (err: any) {
      setError(err?.message || 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  async function setModelActive(id: string, isActive: boolean) {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`/api/admin/taxonomy/models/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Update failed')
      await loadAll()
    } catch (err: any) {
      setError(err?.message || 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  function startEditDepartment(dept: Department) {
    setEditingDepartmentId(dept.id)
    setEditingDeptName(dept.name)
    setEditingDeptDescription(dept.description || '')
  }

  function cancelEditDepartment() {
    setEditingDepartmentId(null)
    setEditingDeptName('')
    setEditingDeptDescription('')
  }

  async function saveDepartmentEdit(e: FormEvent) {
    e.preventDefault()
    if (!editingDepartmentId || !editingDeptName.trim()) return
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`/api/admin/taxonomy/departments/${editingDepartmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingDeptName.trim(),
          description: editingDeptDescription.trim() || null,
        }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Update failed')
      cancelEditDepartment()
      await loadAll()
    } catch (err: any) {
      setError(err?.message || 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  function startEditDevice(device: Device) {
    setEditingDeviceId(device.id)
    setEditingDeviceName(device.name)
    setEditingDeviceModel(device.model)
    setEditingDeviceDescription(device.description || '')
    setEditingDeviceDepartmentId(device.departmentId || '')
    setEditingDeviceKnowledgeComplete(Boolean(device.knowledgeComplete))
    setEditingDeviceKnowledgeScore(typeof device.knowledgeScore === 'number' ? String(device.knowledgeScore) : '')
  }

  function cancelEditDevice() {
    setEditingDeviceId(null)
    setEditingDeviceName('')
    setEditingDeviceModel('')
    setEditingDeviceDescription('')
    setEditingDeviceDepartmentId('')
    setEditingDeviceKnowledgeComplete(false)
    setEditingDeviceKnowledgeScore('')
  }

  async function saveDeviceEdit(e: FormEvent) {
    e.preventDefault()
    if (!editingDeviceId || !editingDeviceName.trim() || !editingDeviceModel.trim() || !editingDeviceDepartmentId) return
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`/api/admin/taxonomy/devices/${editingDeviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingDeviceName.trim(),
          model: editingDeviceModel.trim(),
          description: editingDeviceDescription.trim() || null,
          departmentId: editingDeviceDepartmentId,
          knowledgeComplete: editingDeviceKnowledgeComplete,
          knowledgeScore: editingDeviceKnowledgeScore.trim() ? Number(editingDeviceKnowledgeScore) : undefined,
        }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Update failed')
      cancelEditDevice()
      await loadAll()
    } catch (err: any) {
      setError(err?.message || 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  function startEditModel(model: DeviceModel) {
    setEditingModelId(model.id)
    setEditingModelName(model.modelName)
    setEditingModelYear(model.year ? String(model.year) : '')
    setEditingModelSpecs(model.specifications || '')
  }

  function cancelEditModel() {
    setEditingModelId(null)
    setEditingModelName('')
    setEditingModelYear('')
    setEditingModelSpecs('')
  }

  async function saveModelEdit(e: FormEvent) {
    e.preventDefault()
    if (!editingModelId || !editingModelName.trim()) return
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`/api/admin/taxonomy/models/${editingModelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName: editingModelName.trim(),
          year: editingModelYear.trim() ? Number(editingModelYear) : null,
          specifications: editingModelSpecs.trim() || null,
        }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Update failed')
      cancelEditModel()
      await loadAll()
    } catch (err: any) {
      setError(err?.message || 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Taxonomy Management</h1>
        <div className="flex items-center gap-3">
          <select
            className="rounded border px-2 py-1 text-sm"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Link href="/admin" className="underline">Back to admin</Link>
        </div>
      </header>

      {error ? <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-red-700">{error}</div> : null}

      <section className="mb-8 grid gap-4 lg:grid-cols-3">
        <form onSubmit={createDepartment} className="rounded border p-4">
          <h2 className="mb-3 text-lg font-semibold">Create Department</h2>
          <input
            className="mb-3 w-full rounded border px-3 py-2"
            placeholder="Department name"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
          />
          <textarea
            className="mb-3 w-full rounded border px-3 py-2"
            placeholder="Description (optional)"
            value={deptDescription}
            onChange={(e) => setDeptDescription(e.target.value)}
          />
          <button disabled={busy || !deptName.trim()} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
            Add Department
          </button>
        </form>

        <form onSubmit={createDevice} className="rounded border p-4">
          <h2 className="mb-3 text-lg font-semibold">Create Device</h2>
          <input
            className="mb-2 w-full rounded border px-3 py-2"
            placeholder="Device name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
          />
          <input
            className="mb-2 w-full rounded border px-3 py-2"
            placeholder="Base model"
            value={deviceModel}
            onChange={(e) => setDeviceModel(e.target.value)}
          />
          <textarea
            className="mb-2 w-full rounded border px-3 py-2"
            placeholder="Description (optional)"
            value={deviceDescription}
            onChange={(e) => setDeviceDescription(e.target.value)}
          />
          <select className="mb-3 w-full rounded border px-3 py-2" value={deviceDepartmentId} onChange={(e) => setDeviceDepartmentId(e.target.value)}>
            <option value="">Choose department</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <label className="mb-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={deviceKnowledgeComplete}
              onChange={(e) => setDeviceKnowledgeComplete(e.target.checked)}
            />
            Knowledge complete
          </label>
          <input
            className="mb-3 w-full rounded border px-3 py-2"
            placeholder="Knowledge score (0-1, optional)"
            value={deviceKnowledgeScore}
            onChange={(e) => setDeviceKnowledgeScore(e.target.value)}
          />
          <button disabled={busy || !deviceName.trim() || !deviceModel.trim() || !deviceDepartmentId} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
            Add Device
          </button>
        </form>

        <form onSubmit={createModel} className="rounded border p-4">
          <h2 className="mb-3 text-lg font-semibold">Create Device Model</h2>
          <select className="mb-2 w-full rounded border px-3 py-2" value={modelDeviceId} onChange={(e) => setModelDeviceId(e.target.value)}>
            <option value="">Choose device</option>
            {devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input
            className="mb-2 w-full rounded border px-3 py-2"
            placeholder="Model name"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />
          <input
            className="mb-3 w-full rounded border px-3 py-2"
            placeholder="Production year (optional)"
            value={modelYear}
            onChange={(e) => setModelYear(e.target.value)}
          />
          <textarea
            className="mb-3 w-full rounded border px-3 py-2"
            placeholder="Specifications (optional)"
            value={modelSpecs}
            onChange={(e) => setModelSpecs(e.target.value)}
          />
          <button disabled={busy || !modelDeviceId || !modelName.trim()} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
            Add Model
          </button>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded border p-4">
          <h3 className="mb-3 text-lg font-semibold">Departments</h3>
          {loading ? <p>Loading...</p> : null}
          <ul className="space-y-2 text-sm">
            {departments.map((d) => (
              <li key={d.id} className="rounded bg-slate-50 p-2">
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-slate-600">Status: {d.isActive === false ? 'Inactive' : 'Active'}</div>
                <div className="text-xs text-slate-600">Archived At: {d.archivedAt ? new Date(d.archivedAt).toLocaleString() : 'N/A'}</div>
                <div className="text-xs text-slate-600">Devices: {d._count?.devices ?? 0}</div>
                {editingDepartmentId === d.id ? (
                  <form onSubmit={saveDepartmentEdit} className="mt-2 space-y-2">
                    <input
                      className="w-full rounded border px-2 py-1 text-xs"
                      value={editingDeptName}
                      onChange={(e) => setEditingDeptName(e.target.value)}
                      placeholder="Department name"
                    />
                    <textarea
                      className="w-full rounded border px-2 py-1 text-xs"
                      value={editingDeptDescription}
                      onChange={(e) => setEditingDeptDescription(e.target.value)}
                      placeholder="Description"
                    />
                    <div className="flex gap-2">
                      <button disabled={busy} className="rounded border px-2 py-1 text-xs">Save</button>
                      <button type="button" disabled={busy} onClick={cancelEditDepartment} className="rounded border px-2 py-1 text-xs">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <button
                      disabled={busy}
                      onClick={() => setDepartmentActive(d.id, d.isActive === false)}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      {d.isActive === false ? 'Activate' : 'Deactivate'}
                    </button>
                    <button disabled={busy} onClick={() => startEditDepartment(d)} className="rounded border px-2 py-1 text-xs">Edit</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded border p-4">
          <h3 className="mb-3 text-lg font-semibold">Devices</h3>
          {loading ? <p>Loading...</p> : null}
          <ul className="space-y-2 text-sm">
            {devices.map((d) => (
              <li key={d.id} className="rounded bg-slate-50 p-2">
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-slate-600">Model: {d.model}</div>
                <div className="text-xs text-slate-600">Status: {d.isActive === false ? 'Inactive' : 'Active'}</div>
                <div className="text-xs text-slate-600">Archived At: {d.archivedAt ? new Date(d.archivedAt).toLocaleString() : 'N/A'}</div>
                <div className="text-xs text-slate-600">Department: {d.departmentId ? departmentMap.get(d.departmentId) : 'N/A'}</div>
                {editingDeviceId === d.id ? (
                  <form onSubmit={saveDeviceEdit} className="mt-2 space-y-2">
                    <input
                      className="w-full rounded border px-2 py-1 text-xs"
                      value={editingDeviceName}
                      onChange={(e) => setEditingDeviceName(e.target.value)}
                      placeholder="Device name"
                    />
                    <input
                      className="w-full rounded border px-2 py-1 text-xs"
                      value={editingDeviceModel}
                      onChange={(e) => setEditingDeviceModel(e.target.value)}
                      placeholder="Base model"
                    />
                    <textarea
                      className="w-full rounded border px-2 py-1 text-xs"
                      value={editingDeviceDescription}
                      onChange={(e) => setEditingDeviceDescription(e.target.value)}
                      placeholder="Description"
                    />
                    <select
                      className="w-full rounded border px-2 py-1 text-xs"
                      value={editingDeviceDepartmentId}
                      onChange={(e) => setEditingDeviceDepartmentId(e.target.value)}
                    >
                      <option value="">Choose department</option>
                      {departments.map((dep) => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
                    </select>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={editingDeviceKnowledgeComplete}
                        onChange={(e) => setEditingDeviceKnowledgeComplete(e.target.checked)}
                      />
                      Knowledge complete
                    </label>
                    <input
                      className="w-full rounded border px-2 py-1 text-xs"
                      placeholder="Knowledge score (0-1, optional)"
                      value={editingDeviceKnowledgeScore}
                      onChange={(e) => setEditingDeviceKnowledgeScore(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button disabled={busy} className="rounded border px-2 py-1 text-xs">Save</button>
                      <button type="button" disabled={busy} onClick={cancelEditDevice} className="rounded border px-2 py-1 text-xs">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <button
                      disabled={busy}
                      onClick={() => setDeviceActive(d.id, d.isActive === false)}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      {d.isActive === false ? 'Activate' : 'Deactivate'}
                    </button>
                    <button disabled={busy} onClick={() => startEditDevice(d)} className="rounded border px-2 py-1 text-xs">Edit</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded border p-4">
          <h3 className="mb-3 text-lg font-semibold">Models</h3>
          {loading ? <p>Loading...</p> : null}
          <ul className="space-y-2 text-sm">
            {models.map((m) => (
              <li key={m.id} className="rounded bg-slate-50 p-2">
                <div className="font-medium">{m.modelName}</div>
                <div className="text-xs text-slate-600">Device: {deviceMap.get(m.deviceId) || m.deviceId}</div>
                <div className="text-xs text-slate-600">Year: {m.year || 'N/A'}</div>
                <div className="text-xs text-slate-600">Status: {m.isActive === false ? 'Inactive' : 'Active'}</div>
                <div className="text-xs text-slate-600">Archived At: {m.archivedAt ? new Date(m.archivedAt).toLocaleString() : 'N/A'}</div>
                {editingModelId === m.id ? (
                  <form onSubmit={saveModelEdit} className="mt-2 space-y-2">
                    <input
                      className="w-full rounded border px-2 py-1 text-xs"
                      value={editingModelName}
                      onChange={(e) => setEditingModelName(e.target.value)}
                      placeholder="Model name"
                    />
                    <input
                      className="w-full rounded border px-2 py-1 text-xs"
                      value={editingModelYear}
                      onChange={(e) => setEditingModelYear(e.target.value)}
                      placeholder="Production year"
                    />
                    <textarea
                      className="w-full rounded border px-2 py-1 text-xs"
                      value={editingModelSpecs}
                      onChange={(e) => setEditingModelSpecs(e.target.value)}
                      placeholder="Specifications"
                    />
                    <div className="flex gap-2">
                      <button disabled={busy} className="rounded border px-2 py-1 text-xs">Save</button>
                      <button type="button" disabled={busy} onClick={cancelEditModel} className="rounded border px-2 py-1 text-xs">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <button
                      disabled={busy}
                      onClick={() => setModelActive(m.id, m.isActive === false)}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      {m.isActive === false ? 'Activate' : 'Deactivate'}
                    </button>
                    <button disabled={busy} onClick={() => startEditModel(m)} className="rounded border px-2 py-1 text-xs">Edit</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = (await getServerSession(ctx.req as any, ctx.res as any, authOptions as any)) as any
  if (!session || session.user?.role !== 'admin') {
    return { redirect: { destination: '/api/auth/signin', permanent: false } }
  }
  return { props: {} }
}

# Elenchos Kubernetes Manifests

Configuración de Kubernetes para despliegue en producción.

## Estructura

```
k8s/
├── base/               # Recursos base
│   ├── namespace.yaml
│   ├── configmap.yaml
│   └── secrets.yaml
├── backend/            # Backend API
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml
├── frontend/           # Frontend React
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
├── database/           # PostgreSQL
│   ├── statefulset.yaml
│   ├── service.yaml
│   └── pvc.yaml
└── cache/              # Redis
    ├── deployment.yaml
    └── service.yaml
```

## Despliegue

```bash
# Aplicar configuración base
kubectl apply -k k8s/base/

# Aplicar base de datos
kubectl apply -k k8s/database/

# Aplicar cache
kubectl apply -k k8s/cache/

# Aplicar backend
kubectl apply -k k8s/backend/

# Aplicar frontend
kubectl apply -k k8s/frontend/
```

## Monitoreo

- Prometheus: métricas de la aplicación
- Grafana: dashboards de visualización
- Loki: logs centralizados

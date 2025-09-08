<template>
  <q-page>
    <q-card>
      <q-card-section>
        <div class="row q-mb-md">
          <div class="col">
            <div class="text-bold text-subtitle1 text-green-9">Activity Logs</div>
          </div>
          <div class="col-auto">
            <q-btn
              color="primary"
              icon="refresh"
              flat
              round
              dense
              @click="refreshLogs"
              :loading="activityStore.loading"
            >
              <q-tooltip>Refresh logs</q-tooltip>
            </q-btn>
          </div>
        </div>

        <q-table
          flat
          bordered
          :rows="formattedLogs"
          :columns="columns"
          row-key="id"
          binary-state-sort
          no-data-label="No activity logs available"
          square
          :rows-per-page-options="[0]"
          style="height: 600px"
          :loading="activityStore.loading"
        >
          <template #body="props">
            <q-tr :props="props">
              <q-td key="log_name" style="font-size: 11px">{{ props.row.log_name }}</q-td>
              <q-td key="description" style="font-size: 11px">{{ props.row.description }}</q-td>
              <q-td key="ip_address" style="font-size: 11px">{{ props.row.ip_address }}</q-td>
              <q-td key="date" style="font-size: 11px">{{ props.row.date }}</q-td>
            </q-tr>
          </template>
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useActivityStore } from '../stores/ActivityStore'

export default {
  setup() {
    const activityStore = useActivityStore()

    const columns = [
      {
        name: 'log_name',
        label: 'User',
        field: 'log_name',
        sortable: true,
        align: 'left',
        headerClasses: 'bg-grey-7 text-white',
      },
      {
        name: 'description',
        label: 'Description',
        field: 'description',
        sortable: true,
        align: 'left',
        headerClasses: 'bg-grey-7 text-white',
      },

      {
        name: 'ip_address',
        label: 'IP Address',
        field: 'ip_address',
        sortable: true,
        align: 'left',
        headerClasses: 'bg-grey-7 text-white',
      },
      {
        name: 'date',
        label: 'Date',
        field: 'date',
        sortable: true,
        align: 'left',
        headerClasses: 'bg-grey-7 text-white',
      },
    ]

    const formattedLogs = computed(() => {
      return activityStore.logs.map((log) => ({
        ...log,
        ip_address: log.properties && log.properties.ip ? log.properties.ip : 'N/A',
        date: log.properties && log.properties.date ? log.properties.date : 'N/A',
      }))
    })

    const refreshLogs = () => {
      activityStore.fetchActivityLogs()
    }

    // Load data on mount
    onMounted(() => {
      activityStore.fetchActivityLogs()
    })

    return {
      activityStore,
      columns,
      formattedLogs,
      refreshLogs,
    }
  },
}
</script>

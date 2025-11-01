"use client"
import { useGetAccounts } from "../../../features/accounts/api/use-get-account"

export default  function Home() {
  const accountsQuery =  useGetAccounts()
  return (
    <div>
      {accountsQuery.data?.name}
    </div>
  )
}

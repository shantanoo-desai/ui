/*******************************************************************************
 *     ___                  _   ____  ____
 *    / _ \ _   _  ___  ___| |_|  _ \| __ )
 *   | | | | | | |/ _ \/ __| __| | | |  _ \
 *   | |_| | |_| |  __/\__ \ |_| |_| | |_) |
 *    \__\_\\__,_|\___||___/\__|____/|____/
 *
 *  Copyright (c) 2014-2019 Appsicle
 *  Copyright (c) 2019-2022 QuestDB
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 ******************************************************************************/

import { QuestContext } from "../../../providers"
import React, { useContext, useEffect, useState } from "react"
import styled from "styled-components"
import * as QuestDB from "../../../utils/questdb"
import { SecondaryButton } from "../../../components"
import { formatCommitHash, formatVersion } from "./services"
import { ExternalLink, ArrowUpCircle } from "styled-icons/remix-line"
import { Release } from "../../../utils/questdb"
import { compare } from "compare-versions"

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  & > :not(:last-child) {
    margin-right: 1rem;
  }
`
const ReleaseNotesButton = styled(SecondaryButton)`
  position: relative;
`

const QuestDBVersion = styled.span`
  margin-right: 0.5rem;
`

const UpgradeIcon = styled(ArrowUpCircle)`
  color: ${({ theme }) => theme.color.draculaGreen};
`

const NewestRelease = styled.span`
  color: ${({ theme }) => theme.color.draculaGreen};
  font-size: ${({ theme }) => theme.fontSize.xs};
`

const BuildVersion = () => {
  const { quest } = useContext(QuestContext)
  const [buildVersion, setBuildVersion] = useState("")
  const [commitHash, setCommitHash] = useState("")
  const [newestRelease, setNewestRelease] = useState<Release | null>(null)

  useEffect(() => {
    void quest.queryRaw("select build", { limit: "0,1000" }).then((result) => {
      if (result.type === QuestDB.Type.DQL) {
        if (result.count === 1) {
          setBuildVersion(formatVersion(result.dataset[0][0]))
          setCommitHash(formatCommitHash(result.dataset[0][0]))
        }
      }
    })
  }, [])

  useEffect(() => {
    if (buildVersion) {
      void quest.getLatestRelease().then((release: Release) => {
        if (release.name) {
          setNewestRelease(release)
        }
      })
    }
  }, [buildVersion])

  if (!buildVersion.length && !commitHash.length) return null

  const upgradeAvailable =
    newestRelease && compare(buildVersion, newestRelease.name, "<")

  const releaseUrl =
    upgradeAvailable && newestRelease
      ? newestRelease.html_url
      : `https://github.com/questdb/questdb${
          buildVersion
            ? `/releases/tag/${buildVersion}`
            : `/commit/${commitHash}`
        }`

  return (
    <Wrapper>
      <a href={releaseUrl} rel="noopener noreferrer" target="_blank">
        <ReleaseNotesButton
          title={`Show ${buildVersion ? "release notes" : "commit details"}`}
        >
          <QuestDBVersion>QuestDB {buildVersion || "Dev"}</QuestDBVersion>
          {upgradeAvailable ? (
            <UpgradeIcon size="18px" />
          ) : (
            <ExternalLink size="16px" />
          )}
          {upgradeAvailable && newestRelease && (
            <NewestRelease>{newestRelease.name}</NewestRelease>
          )}
        </ReleaseNotesButton>
      </a>
    </Wrapper>
  )
}

export default BuildVersion
